import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar(){
    return(
        <div className={styles.navbar}>
                <Link href="/">
                    <img src="/images/home.svg" className={styles.home}/>
                </Link>
                <Link href="/todo">
                    <img src="/images/checkbox.svg" className={styles.checkbox}/>
                </Link>
                <Link href="/timer">
                    <img src="/images/timer.svg" className={styles.timer}/>
                </Link>
                <Link href="/pomodoro">
                    <img src="/images/tomato.svg" className={styles.pomodoro}/>
                </Link>
            </div>
    )
}