import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";

import prisma, { testDatabaseConnection } from "./configs/prisma.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

import workspaceRouter from "./routes/workspaceRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

const app = express();

await testDatabaseConnection();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    credentials: true
}));

app.use(express.json());

app.use(clerkMiddleware());

app.use("/api/inngest", serve({
    client: inngest,
    functions
}));

app.use("/api/workspaces", protect, workspaceRouter);

app.get("/", (req, res) => {
    res.send("Server Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});