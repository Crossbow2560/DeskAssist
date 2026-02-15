"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Timers.module.css";

export default function Timers() {
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState("idle");
  const [endsAt, setEndsAt] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // 🔥 Fetch timer from backend
  const fetchTimer = async () => {
    try {
      const res = await fetch("http://localhost:4000/timer/getTimer", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data) return;

      // Determine correct remaining time
      let remaining = 0;

      if (data.status === "running" && data.ends_at) {
        const now = new Date();
        const end = new Date(data.ends_at);

        remaining = Math.max(
          Math.floor((end.getTime() - now.getTime()) / 1000),
          0
        );
      } else if (data.status === "paused") {
        remaining = data.remaining_seconds;
      } else {
        remaining = data.duration_seconds;
      }

      setTime(remaining);
      setStatus(data.status ?? "idle");
      setEndsAt(data.ends_at ?? null);

    } catch (err) {
      console.error("Failed to load timer:", err);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchTimer();
  }, []);

  // 🔥 Accurate countdown (no drift)
  useEffect(() => {
    if (status === "running" && endsAt) {

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const now = new Date();
        const end = new Date(endsAt);

        const remaining = Math.max(
          Math.floor((end.getTime() - now.getTime()) / 1000),
          0
        );

        setTime(remaining);

        if (remaining === 0) {
          clearInterval(intervalRef.current!);
          setStatus("completed");
        }

      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, endsAt]);

  // ▶ Start
  const handleStart = async () => {
    await fetch("http://localhost:4000/timer/start", {
      method: "PATCH",
      credentials: "include",
    });

    await fetchTimer(); // reload correct ends_at
  };

  // ⏸ Pause
  const handlePause = async () => {
    await fetch("http://localhost:4000/timer/pause", {
      method: "PATCH",
      credentials: "include",
    });

    await fetchTimer();
  };

  // 🔄 Reset
  const handleReset = async () => {
    await fetch("http://localhost:4000/timer/reset", {
      method: "PATCH",
      credentials: "include",
    });

    await fetchTimer();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Timer</div>

      <div className={styles.timer}>{formatTime(time)}</div>

      <div className={styles.buttons}>
        <div className={styles.button}>
          <img
            src="/images/play-button.svg"
            className={styles.play}
            onClick={handleStart}
          />
        </div>

        <div className={styles.button}>
          <img
            src="/images/pause-button.svg"
            className={styles.pause}
            onClick={handlePause}
          />
        </div>

        <div className={styles.button}>
          <img
            src="/images/reset-button.svg"
            className={styles.reset}
            onClick={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
