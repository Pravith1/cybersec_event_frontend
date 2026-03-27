import { Link } from 'react-router-dom';
import styles from './LeaderboardPage.module.css';

export default function LeaderboardPage() {
  return (
    <div className={styles.leaderboard}>
      <Link to="/dashboard" className={styles.backLink}>
        ← BACK TO DASHBOARD
      </Link>

      <div className={styles.container}>
        <div className={styles.icon}>🏆</div>
        <h1 className={styles.title}>
          LEADER<span className={styles.titleAccent}>BOARD</span>
        </h1>
        <p className={styles.subtitle}>// ranking system</p>
        <p className={styles.description}>
          The leaderboard is currently being deployed. Rankings will be available 
          once all agents have commenced their operations. Stay sharp.
        </p>
        <div className={styles.statusBadge}>
          <span className={styles.statusDot} />
          COMING SOON
        </div>
      </div>
    </div>
  );
}
