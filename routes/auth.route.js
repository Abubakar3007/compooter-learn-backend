import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { register, login, forgotPassword, getMe } from "../controllers/student.controller.js";
const router = express.Router();
// register
router.post("/register", register);

// login
router.post("/login", login);
// forgot password
router.post("/forgot-password", forgotPassword);
// change password

// delete account


router.get("/me", protect, getMe);

export default router;
