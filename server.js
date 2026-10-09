import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import AuthRoute from "./src/routes/userRoute.js";
import JobRoute from "./src/routes/jobRoute.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/api/", (req, res) => {
  res.json({
    message: "Fixora API is running",
  });
});

app.use("/api/auth", AuthRoute);
app.use("/api/job/", JobRoute);

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
