import styles from './Footer.module.css';
import Link from 'next/link'; // Make sure to import Link from 'next/link'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-content']}>
        <p>&copy; {new Date().getFullYear()} Mateng</p>
      </div>
      <div className={styles['footer-right']}>
        <Link href="/about-us">About Us</Link>
        <Link href="/openings">Carrers</Link>
        <Link href="/terms">Terms and Conditions</Link>
        <Link href="/employee-login">Employee Dashboard</Link>
      </div>
    </footer>
  );
}
