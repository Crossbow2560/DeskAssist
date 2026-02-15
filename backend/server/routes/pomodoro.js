import express from "express";
import supabase from "../supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
---------------------------------------------------
GET CURRENT SESSION
---------------------------------------------------
*/
router.get("/getSession", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    if (!data) return res.json(null);

    if (data.status === "running" && data.phase_ends_at) {
      const now = new Date();
      const end = new Date(data.phase_ends_at);

      const remaining = Math.max(
        Math.floor((end.getTime() - now.getTime()) / 1000),
        0
      );

      // If phase ended → auto transition
      if (remaining === 0) {
        return await transitionPhase(user_id, data, res);
      }

      return res.json({
        ...data,
        remaining_seconds: remaining,
      });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

/*
---------------------------------------------------
START
---------------------------------------------------
*/
router.patch("/start", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const { data: session } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user_id)
      .single();

    const now = new Date();

    const durationMin =
      session.current_phase === "work"
        ? session.work_duration_min
        : session.current_phase === "short_break"
        ? session.short_break_min
        : session.long_break_min;

    const endsAt = new Date(now.getTime() + durationMin * 60 * 1000);

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .update({
        status: "running",
        phase_started_at: now.toISOString(),
        phase_ends_at: endsAt.toISOString(),
      })
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start session" });
  }
});

/*
---------------------------------------------------
PAUSE
---------------------------------------------------
*/
router.patch("/pause", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const { data: session } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (!session.phase_ends_at) return res.json(session);

    const now = new Date();
    const end = new Date(session.phase_ends_at);

    const remaining = Math.max(
      Math.floor((end.getTime() - now.getTime()) / 1000),
      0
    );

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .update({
        status: "paused",
        phase_started_at: null,
        phase_ends_at: null,
      })
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ ...data, remaining_seconds: remaining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to pause session" });
  }
});

/*
---------------------------------------------------
RESET
---------------------------------------------------
*/
router.patch("/reset", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .update({
        status: "idle",
        current_cycle: 1,
        current_phase: "work",
        phase_started_at: null,
        phase_ends_at: null,
        completed_cycles: 0,
      })
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset session" });
  }
});

/*
---------------------------------------------------
PHASE TRANSITION
---------------------------------------------------
*/
async function transitionPhase(user_id, session, res) {
  let nextPhase;
  let nextCycle = session.current_cycle;
  let completed = session.completed_cycles;

  if (session.current_phase === "work") {
    completed++;

    if (completed % session.cycles_before_long_break === 0) {
      nextPhase = "long_break";
    } else {
      nextPhase = "short_break";
    }
  } else {
    nextPhase = "work";
    nextCycle++;
  }

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .update({
      current_phase: nextPhase,
      current_cycle: nextCycle,
      completed_cycles: completed,
      status: "idle",
      phase_started_at: null,
      phase_ends_at: null,
    })
    .eq("user_id", user_id)
    .select()
    .single();

  if (error) throw error;

  return res.json(data);
}

export default router;
