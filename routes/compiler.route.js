import express from "express";
import { submitCode, getCode, getLanguages } from "../controllers/submitCode.controller.js";
const router = express.Router();

router.post("/run", submitCode);
router.get("/result/:token", getCode);
router.get("/languages", getLanguages);

export default router;