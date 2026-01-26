"use client";

import styles from "./page.module.css";
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useRef, useState } from "react";

export default function Timer(){

  /* ===============================
     ACTUAL TIMER DISPLAY STATE
  ================================ */
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  /* ===============================
     SETTINGS INPUT STATE
  ================================ */
  const [settingsHours, setSettingsHours] = useState("00");
  const [settingsMinutes, setSettingsMinutes] = useState("00");
  const [settingsSeconds, setSettingsSeconds] = useState("00");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // 🚨 Completion alert
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🧠 Store remaining seconds when paused
  const pausedTotalRef = useRef<number | null>(null);

  // 🔒 Clamp + pad
  const formatTime = (value: string, min: number, max: number) => {
    let num = parseInt(value, 10);

    if (isNaN(num)) num = 0;
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

  // ⏱️ Set display from total seconds
  const setFromTotalSeconds = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    setHours(h.toString().padStart(2, "0"));
    setMinutes(m.toString().padStart(2, "0"));
    setSeconds(s.toString().padStart(2, "0"));
  };

  // Stop running interval ONLY (pause)
  const pauseTimerOnly = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save remaining time for resume
    pausedTotalRef.current = getDisplayTotalSeconds();
    setIsRunning(false);
  };

  // ▶️ Start / Resume Timer
  const startTimer = () => {
    // Clear completion alert
    setIsCompleted(false);

    let total: number;

    if (pausedTotalRef.current !== null) {
      // ▶️ RESUME
      total = pausedTotalRef.current;
      pausedTotalRef.current = null;
    } else {
      // ▶️ FRESH START from settings
      total =
        parseInt(settingsHours) * 3600 +
        parseInt(settingsMinutes) * 60 +
        parseInt(settingsSeconds);

      if (total <= 0) return;

      // Reset display to settings
      setHours(settingsHours);
      setMinutes(settingsMinutes);
      setSeconds(settingsSeconds);
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
        return;
      }

      setFromTotalSeconds(runningTotal);
    }, 1000);
  };

  // ⏸️ Stop button now PAUSES
  const stopTimer = () => {
    pauseTimerOnly();
    setIsCompleted(false);
  };

  // When user edits settings, cancel pause + stop timer
  const onSettingsChange = () => {
    pauseTimerOnly();
    pausedTotalRef.current = null;
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

      {/* TIMER DISPLAY */}
      <div 
        className={`${styles.timer} ${isCompleted ? styles.timerAlert : ""}`}
      >
        {hours}:{minutes}:{seconds}
      </div>

      {/* BUTTONS */}
      <div className={styles.buttonContainer}>
        <div 
          className={styles.button1} 
          onClick={startTimer}
        >
          Start
        </div>
        <div 
          className={styles.button2} 
          onClick={stopTimer}
        >
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

          {/* HOURS */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Hours:</label>
            <input 
              className={styles.input}
              type="number"
              min={0}
              max={99}
              value={settingsHours}
              onChange={(e) => {
                onSettingsChange();
                const val = formatTime(e.target.value, 0, 99);
                setSettingsHours(val);
                setHours(val);
              }}
            />
          </div>

          {/* MINUTES */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Minutes:</label>
            <input 
              className={styles.input}
              type="number"
              min={0}
              max={59}
              value={settingsMinutes}
              onChange={(e) => {
                onSettingsChange();
                const val = formatTime(e.target.value, 0, 59);
                setSettingsMinutes(val);
                setMinutes(val);
              }}
            />
          </div>

          {/* SECONDS */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Seconds:</label>
            <input 
              className={styles.input}
              type="number"
              min={0}
              max={59}
              value={settingsSeconds}
              onChange={(e) => {
                onSettingsChange();
                const val = formatTime(e.target.value, 0, 59);
                setSettingsSeconds(val);
                setSeconds(val);
              }}
            />
          </div>

        </form>
      </div>
    </main>
  );
}
