
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

import authRoute from "./routes/auth.route.js";
import progressRoutes from "./routes/progress.route.js";
import logicChallengeRoutes from "./routes/logic.route.js";
import codeEditorRoutes from "./routes/compiler.route.js";

import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://compooter-learn-client.vercel.app"
    ],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

console.log("Judge0 URL:", process.env.JUDGE0_URL);
console.log("Environment loaded:", !!process.env.JUDGE0_URL);

connectDB();

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/progress", progressRoutes);
app.use("/api/student", logicChallengeRoutes);
app.use("/api/code", codeEditorRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});