import express from "express";
import supabase from "../supabase.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/updateTaskStatus", authMiddleware, async (req, res) => {
  try {
    // 🔹 Get token from cookie
    const user_id = req.user.userId;

    const { task_id, is_checked } = req.body;

    if (!task_id) {
      return res.status(400).json({ message: "Task ID required" });
    }

    // 🔹 Update only if task belongs to this user
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_checked })
      .eq("task_id", task_id)
      .eq("user_id", user_id)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database update failed" });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      updatedTask: data,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
