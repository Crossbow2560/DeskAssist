import supabase from "../supabase.js";
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/name", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  const { data: user, error } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ name: user.name });
});

router.get("/tasks", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ tasks });
});

export default router;
