import supabase from "../supabase.js";
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/task", authMiddleware, async (req, res) => {
  try {
    const token = req.cookies.token; // your cookie name

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const is_checked = false;

    const { task_title, task_description, tags, priority, deadline } = req.body;

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: req.user.userId, // 👈 from JWT
          is_checked,
          task_title,
          task_description,
          tags,
          priority,
          deadline,
        },
      ])
      .select();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.log("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
