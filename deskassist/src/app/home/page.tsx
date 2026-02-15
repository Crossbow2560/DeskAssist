"use client";

import styles from "./page.module.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar/Sidebar";

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    fetch("http://localhost:4000/getUserData/name", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setName(`Welcome, ${data.name}`))
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.mainContent}>
        <div className={styles.spacer}></div>
        <div className={styles.header}>{name}</div>
        <div className={styles.subtext}>What is on your agenda today?</div>
        <div className={styles.imageContainer}>
          <img className={styles.il3} src="/images/Illustration 3.svg" />
        </div>
      </div>
    </div>
  );
}
