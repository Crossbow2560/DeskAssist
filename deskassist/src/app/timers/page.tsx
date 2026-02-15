"use client";

import styles from "./page.module.css";

import Sidebar from "@/components/Sidebar/Sidebar";

export default function Timers() {
    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.header}>My Timers</div>
            </div>
        </div>
    )
}