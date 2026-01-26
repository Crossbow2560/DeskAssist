import Link from "next/link";

import styles from "./page.module.css";

import Navbar from "./components/Navbar/Navbar.jsx"

export default function Home(){
    return(
        <main className={styles.container}>
            <Navbar />
            <div className={styles.header}>Hello!</div>
            <div className={styles.subtext}>What's on your mind today?</div>
        </main>
    )
}