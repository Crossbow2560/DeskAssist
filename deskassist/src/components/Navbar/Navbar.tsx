import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className={styles.navbarContainer}>
      <div className={styles.logo}>DeskAssist</div>
      <div className={styles.optionsContainer}>
        <div className={styles.contact}>Contact</div>
        <div className={styles.about}>About Us</div>
        <Link href="/login">
          <div className={styles.logIn}>Log In</div>
        </Link>
        <div className={styles.signUpButton}>
          <Link href="/signup">
            <div className={styles.signUp}>Sign Up</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
