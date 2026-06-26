import { useNavigate } from 'react-router-dom'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.navBrand}>🔐 MyApp</span>
        <button className={styles.logoutButton} onClick={() => navigate('/')}>
          Log Out
        </button>
      </nav>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heading}>Welcome back! 👋</h1>
          <p className={styles.subheading}>You're successfully logged in. Here's your dashboard.</p>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📊</div>
            <h2 className={styles.cardTitle}>Analytics</h2>
            <p className={styles.cardText}>View your usage stats and reports.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>⚙️</div>
            <h2 className={styles.cardTitle}>Settings</h2>
            <p className={styles.cardText}>Manage your account preferences.</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>🔔</div>
            <h2 className={styles.cardTitle}>Notifications</h2>
            <p className={styles.cardText}>Stay up to date with activity.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
