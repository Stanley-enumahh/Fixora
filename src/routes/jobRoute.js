import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import Pagination from "../middlewares/pagination.js";

import {
  createJob,
  getAvailableJobs,
  getJob,
  getJobsByCategory,
  changeProviderJobStatus,
  // changeCustomerJobStatus,
} from "../controllers/jobController.js";

const router = express.Router();

// Create a job
router.post("/", authMiddleware, createJob);

// Get available jobs (paginated)
router.get("/", authMiddleware, Pagination, getAvailableJobs);

// Get jobs by category (paginated)
router.get(
  "/category/:category",
  authMiddleware,
  Pagination,
  getJobsByCategory,
);

// Provider updates job status
router.patch("/:id/provider-status", authMiddleware, changeProviderJobStatus);

// Customer updates job status
// router.patch("/:id/customer-status", authMiddleware, changeCustomerJobStatus);

// Get a single job
router.get("/:id", authMiddleware, getJob);

export default router;
