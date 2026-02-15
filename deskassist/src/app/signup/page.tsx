"use client";

import styles from "./page.module.css";
import Navbar from "@/components/Navbar/Navbar";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.log("Passwords do not match!");
      return;
    }
    await fetch("http://localhost:4000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    router.push("/login");
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.imageContainer}>
        <img className={styles.il1} src="/images/Illustration 1.svg" />
        <img className={styles.il2} src="/images/Illustration 2.svg" />
      </div>

      <div className={styles.formContainer}>
        <div className={styles.header}>signup.</div>
        <form className={styles.form} onSubmit={handleSubmit} target="_self">
          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input
            className={styles.input}
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            className={styles.input}
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Sign Up
          </button>
        </form>
        <div className={styles.login}>
          Already have an account?{" "}
          <Link className={styles.link} href="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
