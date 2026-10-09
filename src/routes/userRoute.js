import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMe, login, register } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

export default router;
