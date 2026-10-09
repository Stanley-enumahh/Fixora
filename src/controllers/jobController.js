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

    const jobs = await Job.find({
      status: "requested",
      provider: null,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments();

    res.status(200).json({
      jobs,
      pagination: { page, limit, totalJobs },
    });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate("customer", "name");

    res.status(200).json({
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptJob = async (req, res, next) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({
        message: "Only providers can accept jobs",
      });
    }

    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        message: "Job is no longer available",
      });
    }

    res.status(200).json({
      message: "Job accepted successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};
