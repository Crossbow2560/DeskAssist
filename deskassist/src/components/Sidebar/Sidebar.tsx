import styles from "./Sidebar.module.css";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.logo}>DeskAssist</div>
      <div className={styles.menuContainer}>
        <Link href="/home" className={styles.home}>
          Home
        </Link>
        <div className={styles.myStats}>My Stats</div>
        <Link href="/myworkspace" className={styles.myWorkspace}>
          My Workspace
        </Link>
        <Link href="/timers" className={styles.timers}>
          Timers
        </Link>
        <div className={styles.alarms}>Alarms</div>
        <div className={styles.tasks}>Tasks</div>
        <Link href="/settings" className={styles.settings}>
          Settings
        </Link>
      </div>
    </div>
  );
}
