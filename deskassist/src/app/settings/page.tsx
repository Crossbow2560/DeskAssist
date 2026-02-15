"use client";

import styles from "./page.module.css";

import Sidebar from "@/components/Sidebar/Sidebar";

import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logout successful");
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.mainContent}>
        <div className={styles.header}>Settings</div>
        <button onClick={handleLogout} className={styles.button}>
          Log Out
        </button>
      </div>
    </div>
  );
}
