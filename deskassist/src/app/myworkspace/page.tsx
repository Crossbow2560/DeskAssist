
import styles from "./page.module.css";

import Sidebar from "@/components/Sidebar/Sidebar";
import MyTasks from "@/components/MyWorkspace/MyTasks/MyTasks";
import Countdowns from "@/components/MyWorkspace/Countdowns/Countdowns";
import CurrentState from "@/components/MyWorkspace/CurrentState/CurrentState";

export default function MyWorkspace() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.mainContent}>
        <div className={styles.header}>My Workspace</div>
        <div className={styles.content}>
          <div className={styles.subContainer}>
            <MyTasks />
          </div>
          <div className={styles.subContainer}>
            <Countdowns />
            <CurrentState />
          </div>
        </div>
      </div>
    </div>
  );
}
