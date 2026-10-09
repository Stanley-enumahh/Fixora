import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import Pagination from "../middlewares/pagination.js";
import {
  createJob,
  getAvailableJobs,
  getJob,
  acceptJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", authMiddleware, createJob);
router.get("/", Pagination, getAvailableJobs);
router.get("/:id", authMiddleware, getJob);
router.get("/:id", authMiddleware, acceptJob);

export default router;
