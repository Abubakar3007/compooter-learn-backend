import express from "express";
const route = express.Router();
import { getDailyChallenge } from "../controllers/logic.controller.js";

route.post("/logic-challenge", getDailyChallenge);

export default route;