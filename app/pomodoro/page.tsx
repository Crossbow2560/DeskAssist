"use client";

import styles from "./page.module.css"; // reuse same UI
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useRef, useState } from "react";

type Mode = "work" | "break" | "longBreak";

export default function Pomodoro(){

  /* ===============================
     DISPLAY TIMER STATE
  ================================ */
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("00");

  /* ===============================
     SETTINGS STATE
  ================================ */
  const [workMinutes, setWorkMinutes] = useState("25");
  const [breakMinutes, setBreakMinutes] = useState("05");
  const [longBreakMinutes, setLongBreakMinutes] = useState("15");
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState("4");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [mode, setMode] = useState<Mode>("work");
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🧠 Store remaining seconds when paused
  const pausedTotalRef = useRef<number | null>(null);

  // 🔒 Clamp + pad
  const formatTime = (value: string, min: number, max: number) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = min;
    if (num < min) num = min;
    if (num > max) num = max;
    return num.toString().padStart(2, "0");
  };

  // Convert display to total seconds
  const getDisplayTotalSeconds = () => {
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(seconds)
    );
  };

  const stopRunningTimerOnly = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  // ⏱️ Set display from total seconds
  const setFromTotalSeconds = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    setHours(h.toString().padStart(2, "0"));
    setMinutes(m.toString().padStart(2, "0"));
    setSeconds(s.toString().padStart(2, "0"));
  };

  const getModeTotalSeconds = (nextMode: Mode) => {
    if (nextMode === "work") {
      return parseInt(workMinutes) * 60;
    }
    if (nextMode === "break") {
      return parseInt(breakMinutes) * 60;
    }
    return parseInt(longBreakMinutes) * 60;
  };

  const applyModeToDisplay = (nextMode: Mode) => {
    const total = getModeTotalSeconds(nextMode);
    setFromTotalSeconds(total);
  };

  // ⏸️ Pause (Stop button)
  const pauseTimerOnly = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save remaining time for resume
    pausedTotalRef.current = getDisplayTotalSeconds();
    setIsRunning(false);
  };

  // ▶️ Start / Resume Pomodoro
  const startTimer = () => {
    setIsCompleted(false);

    let total: number;

    if (pausedTotalRef.current !== null) {
      // ▶️ RESUME
      total = pausedTotalRef.current;
      pausedTotalRef.current = null;
    } else {
      // ▶️ FRESH START for current mode
      total = getModeTotalSeconds(mode);
      if (total <= 0) return;

      applyModeToDisplay(mode);
    }

    setIsSettingsOpen(false);
    setIsRunning(true);

    let runningTotal = total;

    intervalRef.current = setInterval(() => {
      runningTotal -= 1;

      if (runningTotal <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsRunning(false);
        pausedTotalRef.current = null;
        setFromTotalSeconds(0);
        setIsCompleted(true);

        handleSessionComplete();
        return;
      }

      setFromTotalSeconds(runningTotal);
    }, 1000);
  };

  // 🔁 Handle work/break switching
  const handleSessionComplete = () => {
    if (mode === "work") {
      const nextCount = sessionCount + 1;
      setSessionCount(nextCount);

      const longBreakEvery = parseInt(sessionsBeforeLongBreak);

      if (nextCount % longBreakEvery === 0) {
        setMode("longBreak");
        applyModeToDisplay("longBreak");
      } else {
        setMode("break");
        applyModeToDisplay("break");
      }
    } else {
      setMode("work");
      applyModeToDisplay("work");
    }
  };

  // ⏸️ Stop button = PAUSE
  const stopTimer = () => {
    pauseTimerOnly();
    setIsCompleted(false);
  };

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return(
    <main className={styles.container}>
      <Navbar />

      {/* MODE LABEL */}
      <div style={{ fontSize: "24px", marginBottom: "-10px" }}>
        {mode === "work" && "Work Session"}
        {mode === "break" && "Short Break"}
        {mode === "longBreak" && "Long Break"}
      </div>

      {/* TIMER DISPLAY */}
      <div 
        className={`${styles.timer} ${isCompleted ? styles.timerAlert : ""}`}
      >
        {hours}:{minutes}:{seconds}
      </div>

      {/* SESSION COUNT */}
      <div style={{ fontSize: "18px", opacity: 0.7 }}>
        Session #{sessionCount + 1}
      </div>

      {/* BUTTONS */}
      <div className={styles.buttonContainer}>
        <div className={styles.button1} onClick={startTimer}>
          Start
        </div>
        <div className={styles.button2} onClick={stopTimer}>
          Stop
        </div>
      </div>

      {/* ⚙️ Settings Gear */}
      <div 
        className={`${styles.settings} ${isRunning ? styles.settingsDisabled : ""}`}
        onClick={() => {
          setIsCompleted(false);
          if (isRunning) return;
          setIsSettingsOpen((prev) => !prev);
        }}
      >
        <img 
          className={styles.settingsImage} 
          src="/images/gear-white.svg" 
          alt="Settings"
        />
      </div>

      {/* ⚙️ Settings Menu */}
      <div 
        className={`${styles.settingsMenu} ${isSettingsOpen ? styles.settingsMenuOpen : ""}`}
      >
        <form className={styles.settingsForm}>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Work (min):</label>
            <input 
              className={styles.input}
              type="number"
              min={1}
              max={120}
              value={workMinutes}
              onChange={(e) =>
                setWorkMinutes(formatTime(e.target.value, 1, 120))
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Break (min):</label>
            <input 
              className={styles.input}
              type="number"
              min={1}
              max={60}
              value={breakMinutes}
              onChange={(e) =>
                setBreakMinutes(formatTime(e.target.value, 1, 60))
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Long Break (min):</label>
            <input 
              className={styles.input}
              type="number"
              min={5}
              max={60}
              value={longBreakMinutes}
              onChange={(e) =>
                setLongBreakMinutes(formatTime(e.target.value, 5, 60))
              }
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Sessions before long break:</label>
            <input 
              className={styles.input}
              type="number"
              min={2}
              max={8}
              value={sessionsBeforeLongBreak}
              onChange={(e) =>
                setSessionsBeforeLongBreak(
                  formatTime(e.target.value, 2, 8)
                )
              }
            />
          </div>

        </form>
      </div>
    </main>
  );
}
