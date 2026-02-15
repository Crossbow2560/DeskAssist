import express from "express";
import supabase from "../supabase.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/getTimer", authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.userId;

        const { data, error } = await supabase
            .from("timers")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_active", true)
            .single();

        if (error) throw error;
        if (!data) return res.json(null);

        if (data.status === "running" && data.ends_at) {
            const now = new Date();
            const endsAt = new Date(data.ends_at);

            const remaining = Math.max(
                Math.floor((endsAt - now) / 1000),
                0
            );

            // Auto-complete if finished
            if (remaining === 0) {
                await supabase
                    .from("timers")
                    .update({
                        status: "completed",
                        remaining_seconds: 0,
                        started_at: null,
                        ends_at: null
                    })
                    .eq("user_id", user_id);
            }

            return res.json({
                ...data,
                remaining_seconds: remaining
            });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.patch("/start", authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.userId;

        // Get current timer
        const { data: timer, error: fetchError } = await supabase
            .from("timers")
            .select("*")
            .eq("user_id", user_id)
            .single();

        if (fetchError) throw fetchError;
        if (!timer) return res.status(404).json({ message: "Timer not found" });

        const now = new Date();

        // Use duration if remaining is 0
        const remaining = timer.remaining_seconds > 0
            ? timer.remaining_seconds
            : timer.duration_seconds;

        const endsAt = new Date(now.getTime() + remaining * 1000);

        const { data, error } = await supabase
            .from("timers")
            .update({
                status: "running",
                started_at: now.toISOString(),
                ends_at: endsAt.toISOString(),
                remaining_seconds: remaining
            })
            .eq("user_id", user_id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to start timer" });
    }
});


router.patch("/pause", authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.userId;

        const { data: timer, error: fetchError } = await supabase
            .from("timers")
            .select("*")
            .eq("user_id", user_id)
            .single();

        if (fetchError) throw fetchError;
        if (!timer) return res.status(404).json({ message: "Timer not found" });

        if (!timer.ends_at) {
            return res.json(timer);
        }

        const now = new Date();
        const endsAt = new Date(timer.ends_at);

        const remaining = Math.max(
            Math.floor((endsAt - now) / 1000),
            0
        );

        const { data, error } = await supabase
            .from("timers")
            .update({
                status: "paused",
                remaining_seconds: remaining,
                started_at: null,
                ends_at: null
            })
            .eq("user_id", user_id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to pause timer" });
    }
});


router.patch("/reset", authMiddleware, async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { data, error } = await supabase
            .from("timers")
            .update({ status: "idle", started_at: null, ends_at: null, remaining_seconds: null })
            .eq("user_id", user_id)
            .single();
        
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Failed to reset timer" });
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;