"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Pomodoro.module.css";

export default function Pomodoro() {
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState("idle");
  const [phase, setPhase] = useState("work");
  const [endsAt, setEndsAt] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return "No Timer Found";
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  function titleCase(str: string) {
      if (!str) return "";
      str = str.toLowerCase(); 
      let words = str.split(' '); 
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
      }
      return words.join(' '); 
    }

  const fetchSession = async () => {
    const res = await fetch("http://localhost:4000/pomodoro/getSession", {
      credentials: "include",
    });

    const data = await res.json();
    if (!data) return;

    let remaining = 0;

    if (data.status === "running" && data.phase_ends_at) {
      const now = new Date();
      const end = new Date(data.phase_ends_at);

      remaining = Math.max(
        Math.floor((end.getTime() - now.getTime()) / 1000),
        0
      );
    } else {
      const duration =
        data.current_phase === "work"
          ? data.work_duration_min
          : data.current_phase === "short_break"
          ? data.short_break_min
          : data.long_break_min;

      remaining = duration * 60;
    }

    setTime(remaining);
    setStatus(data.status);
    setPhase(data.current_phase);
    setEndsAt(data.phase_ends_at ?? null);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (status === "running" && endsAt) {
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
          fetchSession();
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, endsAt]);

  const start = async () => {
    await fetch("http://localhost:4000/pomodoro/start", {
      method: "PATCH",
      credentials: "include",
    });
    fetchSession();
  };

  const pause = async () => {
    await fetch("http://localhost:4000/pomodoro/pause", {
      method: "PATCH",
      credentials: "include",
    });
    fetchSession();
  };

  const reset = async () => {
    await fetch("http://localhost:4000/pomodoro/reset", {
      method: "PATCH",
      credentials: "include",
    });
    fetchSession();
  };

  return (
    <div className={styles.container}>
      {/* <h2>{phase.toUpperCase()}</h2> */}
      <div className={styles.header}>Pomodoro - {titleCase(phase)}</div>
      <div className={styles.timer}>{formatTime(time)}</div>

      <div className={styles.buttons}>
        <div className={styles.button}>
          <img
            src="/images/play-button.svg"
            className={styles.play}
            onClick={start}
          />
        </div>

        <div className={styles.button}>
          <img
            src="/images/pause-button.svg"
            className={styles.pause}
            onClick={pause}
          />
        </div>

        <div className={styles.button}>
          <img
            src="/images/reset-button.svg"
            className={styles.reset}
            onClick={reset}
          />
        </div>
      </div>
    </div>
  );
}
