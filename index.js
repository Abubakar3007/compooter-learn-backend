import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

import authRoute from "./routes/auth.route.js";
import progressRoutes from "./routes/progress.route.js";
import logicChallengeRoutes from "./routes/logic.route.js";

import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Init middleware
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://compooter-learn-client.vercel.app/",
    ],
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoute);
app.use("/api/progress", progressRoutes);
app.use("/api/student", logicChallengeRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});