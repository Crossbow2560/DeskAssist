// server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import getDataRoutes from "./routes/getData.js";
import tasksRoutes from "./routes/postData.js";
import updateDataRoutes from "./routes/updateData.js";
import timerRoutes from "./routes/timer.js";
import pomodoroRoutes from "./routes/pomodoro.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use("/auth", authRoutes);
app.use("/getUserData", getDataRoutes);
app.use("/postData", tasksRoutes);
app.use("/updateData", updateDataRoutes);
app.use("/timer", timerRoutes);
app.use("/pomodoro", pomodoroRoutes);

app.listen(4000, () => {
  console.log("Auth server running on port 4000");
});
