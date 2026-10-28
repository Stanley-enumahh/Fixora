import mongoose from "mongoose";
import Job from "../models/jobModel.js";

export const createJob = async (req, res, next) => {
  try {
    const { service, description, location, price } = req.body;

    if (!service || !description || !location) {
      return res.status(400).json({
        message: "Service, description and location are required",
      });
    }

    const job = await Job.create({
      customer: req.user._id,
      service,
      description,
      location,
      price,
    });

    res.status(201).json({
      message: "Job request created successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableJobs = async (req, res, next) => {
  try {
    const { skip, limit, page } = req.Pagination;

    const query = {
      status: "requested",
      provider: null,
    };

    const jobs = await Job.find(query)
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(query);

    res.status(200).json({
      message: "Available jobs fetched successfully",
      jobs,
      pagination: {
        page,
        limit,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(id).populate("customer", "name email");

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json({
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { skip, limit, page } = req.Pagination;

    if (!category || !category.trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    // Escape regex characters in user input
    const escapedCategory = category
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query = {
      service: {
        $regex: `^${escapedCategory}$`,
        $options: "i",
      },
      status: "requested",
      provider: null,
    };

    const jobs = await Job.find(query)
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(query);

    res.status(200).json({
      message: "Jobs fetched successfully",
      category: category.trim(),
      jobs,
      pagination: {
        page,
        limit,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changeProviderJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (req.user.role !== "provider") {
      return res.status(403).json({
        message: "Only providers can perform this action",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const transitions = {
      accepted: "requested",
      in_progress: "accepted",
      awaiting_review: "in_progress",
    };

    if (!Object.hasOwn(transitions, status)) {
      return res.status(400).json({
        message: "Invalid provider job status",
      });
    }

    const filter = {
      _id: id,
      status: transitions[status],
      ...(status === "accepted" ? { provider: null } : { provider: userId }),
    };

    const update = {
      $set: {
        status,
        ...(status === "accepted" ? { provider: userId } : {}),
      },
    };

    const job = await Job.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name")
      .populate("provider", "name");

    if (!job) {
      const existingJob = await Job.findById(id);

      if (!existingJob) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      return res.status(409).json({
        message:
          "Job is unavailable, assigned to another provider, or has an invalid status transition",
      });
    }

    res.status(200).json({
      message: "Job status updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};
