import cors from "cors";
import dotenv from "dotenv";
import express from "express";
// Add this near the top
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running perfectly!" });
});

app.use("/api/auth", authRoutes);

export default app;
