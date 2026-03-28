import { useEffect } from 'react';
import styles from './RoundTransition.module.css';

export default function RoundTransition({ round, onComplete, isGameOver = false }) {
  useEffect(() => {
    if (isGameOver) return undefined;

    const timer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => clearTimeout(timer);
  }, [isGameOver, onComplete]);

  const title = isGameOver ? 'GAME OVER' : `ROUND ${round}`;
  const subtitle = isGameOver
    ? '// operation concluded'
    : '// initializing next sequence...';

  return (
    <div className={styles.overlay}>
      <div className={styles.scanLine} />
      <div className={styles.cornerTL} />
      <div className={styles.cornerBR} />

      <div className={styles.content}>
        <div className={styles.roundNum}>{round}</div>
        <div className={styles.glitchText} data-text={title}>
          {title}
        </div>
        <div className={styles.subText}>{subtitle}</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </div>
    </div>
  );
}
