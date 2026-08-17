import "dotenv/config";
import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", Number(process.env.PORT) || 8005);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    // attempt to connect to MongoDB but don't crash the server if it fails
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/zoom";
    try {
        const connectionDb = await mongoose.connect(MONGO_URI);
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message || err);
        console.error("Continuing to start server — DB operations will return errors until Mongo is available.");
    }

    server.listen(app.get("port"), () => {
        console.log(`LISTENING ON PORT ${app.get("port")}`);
    });
};

start();
