import express from "express";
import mongoose from "mongoose";
import redis from "redis";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(cors());
app.use(express.json());

/** ======================== 1️⃣ Database & Redis Setup ======================== */

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((error) => console.error("❌ Failed to connect to Database:", error));

// Redis Connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient
  .connect()
  .then(() => console.log("✅ Redis Connected"))
  .catch((error) => console.error("❌ Error connecting to Redis:", error));

/** ======================== 2️⃣ Schema & Models ======================== */

// Display Schema
const displaySchema = new mongoose.Schema({
  data: [Number],
  timestamp: { type: Date, default: Date.now },
  anomalyDetected: { type: Boolean, default: false },
});
const Display = mongoose.model("Display", displaySchema);

// User Schema for Authentication
const userSchema = new mongoose.Schema({
  username: String,
  passwordHash: String, // Hashed password
});
const User = mongoose.model("User", userSchema);

/** ======================== 3️⃣ Authentication (JWT) ======================== */

// Secret Key for JWT
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "d1b5ef6d8467a2786c267a17e17eb56cb40174428a36ddcbbc690c378d93f2af";

// Middleware for Protected Routes
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
}

// User Registration (Hashing password before storing)
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  await User.create({ username, passwordHash });
  res.json({ message: "User registered successfully" });
});

// User Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const user = await User.findOne({ username, passwordHash });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

/** ======================== 4️⃣ Live Display Simulation ======================== */

// Generate Random 12-Digit Data
function generateRandomDisplay() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
}

// AI-Based Anomaly Detection (Checks for repeating or extreme variations)
function detectAnomaly(data) {
  const sum = data.reduce((acc, val) => acc + val, 0);
  const avg = sum / data.length;
  const threshold = 5; // Adjust as needed
  return data.some((num) => Math.abs(num - avg) > threshold);
}

// Function to Cache & Store Data
async function cacheAndStoreData(newDisplay) {
  const prevData = JSON.parse((await redisClient.get("live_display")) || "[]");

  if (JSON.stringify(prevData) !== JSON.stringify(newDisplay)) {
    io.emit("displayUpdate", newDisplay);
    await redisClient.set("live_display", JSON.stringify(newDisplay));

    const anomalyDetected = detectAnomaly(newDisplay);
    await Display.create({ data: newDisplay, anomalyDetected });

    if (anomalyDetected) {
      console.log("⚠️ Anomaly Detected:", newDisplay);
    }
  }
}

// Update Display Every 1 Second
setInterval(async () => {
  const newDisplay = generateRandomDisplay();
  await cacheAndStoreData(newDisplay);
}, 1000);

/** ======================== 5️⃣ API Endpoints ======================== */

// Get Latest Display Data (Public API)
app.get("/api/live-data", async (req, res) => {
  const data = await Display.find().sort({ timestamp: -1 }).limit(1);
  res.json(data[0]);
});

// Get Anomaly Data (Protected Route)
app.get("/api/anomalies", authenticateToken, async (req, res) => {
  const anomalies = await Display.find({ anomalyDetected: true })
    .sort({ timestamp: -1 })
    .limit(10);
  res.json(anomalies);
});

// Clear Database (Protected Route)
app.delete("/api/clear", authenticateToken, async (req, res) => {
  await Display.deleteMany({});
  await redisClient.del("live_display");
  res.json({ message: "Database cleared successfully" });
});

/** ======================== 6️⃣ Start Server ======================== */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
