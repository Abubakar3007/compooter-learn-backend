import express from "express";
const router = express.Router();

import { completeLesson, getCourseProgress } from "../controllers/progress.controller.js";
import { protect } from "../middleware/auth.middleware.js";
router.post("/complete", protect, completeLesson);
router.get("/:courseId", protect, getCourseProgress);

export default router;