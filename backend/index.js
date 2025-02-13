import express from "express";
import mongoose from "mongoose";
import redis from "redis";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(cors());


mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Database Connected Successfully");
    })
    .catch((error) => {
        console.log("Failed to connect to Database");
        console.log(error);
    });

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

redisClient.connect()
    .then(() => {
        console.log("Redis connected");
    })
    .catch((error) => {
        console.log("Error while connecting to Redis");
        console.log(error);
    });

const displaySchema = mongoose.Schema({
    data: [Number],
    timestamp: { type: Date, default: Date.now },
});

const Display = mongoose.model("Display", displaySchema);

function generateRandom() {
    const randomArray = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
    console.log(randomArray);
    return randomArray;
}

generateRandom();

async function cacheAndStoreData(newDisplay) {
    const prevData = JSON.parse(await redisClient.get("live_display") || "[]");
    if (JSON.stringify(prevData) !== JSON.stringify(newDisplay)) {
        io.emit("displayUpdate", newDisplay);
        await redisClient.set("live_display", JSON.stringify(newDisplay));
        await Display.create({ data: newDisplay });
    }
}

setInterval(async () => {
    const newDisplay = generateRandom();
    await cacheAndStoreData(newDisplay);
}, 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});