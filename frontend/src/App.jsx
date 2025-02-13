import { useEffect, useState } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

export default function App() {
  const [display, setDisplay] = useState(Array(12).fill(0));

  useEffect(() => {
    socket.on("displayUpdate", (data) => setDisplay(data));
    return () => socket.off("displayUpdate");
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <h1 className="text-4xl font-bold mb-6 drop-shadow-md">Live Display</h1>
      <div className="bg-white text-black p-6 rounded-lg shadow-xl w-96 text-center">
        <div className="grid grid-cols-4 gap-4 text-3xl font-semibold">
          {display.map((num, i) => (
            <div key={i} className="p-4 bg-gray-200 rounded-lg shadow-md">
              {num}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
