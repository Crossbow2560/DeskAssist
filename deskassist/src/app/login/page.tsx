"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar/Navbar";

import styles from "./page.module.css";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // IMPORTANT for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login failed:", data);
        return;
      }

      console.log("Login successful:", data);

      setEmail("");
      setPassword("");
      router.push("/home");
    } catch (err) {
      console.error("Network error:", err);
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.imageContainer}>
        <img className={styles.il1} src="/images/Illustration 1.svg" />
        <img className={styles.il2} src="/images/Illustration 2.svg" />
      </div>

      <div className={styles.formContainer}>
        <div className={styles.header}>login.</div>
        <form className={styles.form} onSubmit={handleLogin}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            className={styles.input}
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            className={styles.input}
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Log In
          </button>
        </form>
        <div className={styles.signup}>
          Don't have an account?{" "}
          <Link className={styles.link} href="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
