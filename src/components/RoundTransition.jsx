import { useEffect } from 'react';
import styles from './RoundTransition.module.css';

export default function RoundTransition({ round, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.overlay}>
      <div className={styles.scanLine} />
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      <div className={styles.content}>
        <div className={styles.roundNum}>{round}</div>
        <div className={styles.glitchText} data-text={`ROUND ${round}`}>
          ROUND {round}
        </div>
        <div className={styles.subText}>// initializing next sequence...</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </div>
    </div>
  );
}
