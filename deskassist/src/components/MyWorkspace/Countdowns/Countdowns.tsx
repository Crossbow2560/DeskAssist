"use client";


import styles from "./Countdowns.module.css";
import Timers from "../Timers/Timers";
import Pomodoro from "../Pomodoro/Pomodoro";

import { useState } from "react";

export default function Countdowns() {
    const [state, setState] = useState("pomodoro");

    const changeState = (newState: string) => {
        setState(newState);
    }

    return (
        <>
            <div className={styles.buttons}>
              <div className={state === "timer" ? styles.activeButton : styles.button} onClick={() => changeState("timer")}>Timer</div>
              <div className={state === "pomodoro" ? styles.activeButton : styles.button} onClick={() => changeState("pomodoro")}>Pomodoro</div>
            </div>
            {state === "timer" && <Timers />}
            {state === "pomodoro" && <Pomodoro />}
        </>
    );
}