import Navbar from "@/components/Navbar/Navbar";

import styles from "./page.module.css";

import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <div className={styles.imageContainer}>
        <img className={styles.il1} src="/images/Illustration 1.svg" />
        <img className={styles.il2} src="/images/Illustration 2.svg" />
      </div>
      <div className={styles.header}>
        Level-Up your Productivity with DeskAssist
      </div>
      <div className={styles.subheader}>Train Your Focus. Get More Done.</div>
      <Link href="/signup">
        <div className={styles.button}>Get Started</div>
      </Link>
    </>
  );
}
