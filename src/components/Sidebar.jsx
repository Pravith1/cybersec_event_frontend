import styles from './Sidebar.module.css';

export default function Sidebar({ questions, activeQuestionId, onSelectQuestion, loading, currentRound }) {
  if (loading) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>◆ QUESTIONS</div>
          <div className={styles.sidebarSub}>loading...</div>
        </div>
        <div className={`${styles.emptyState} ${styles.loadingPulse}`}>
          [ DECRYPTING... ]
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>◆ QUESTIONS</div>
        <div className={styles.sidebarSub}>
          {questions.length} targets • round {currentRound || '?'}
        </div>
      </div>

      <div className={styles.questionList}>
        {questions.length === 0 ? (
          <div className={styles.emptyState}>[ NO QUESTIONS AVAILABLE ]</div>
        ) : (
          questions.map((q, idx) => {
            const isActive = q.question_id === activeQuestionId;
            const isSolved = q.solved; // will be tracked locally
            
            const formatPoints = (pts) => {
              const num = parseFloat(pts);
              if (isNaN(num)) return pts;
              return Number.isInteger(num) ? num : num.toFixed(2);
            };
            return (
              <button
                key={q.question_id}
                className={`${styles.questionItem} ${isActive ? styles.questionItemActive : ''} ${isSolved ? styles.questionItemSolved : ''}`}
                onClick={() => onSelectQuestion(q.question_id)}
              >
                <div className={`${styles.qIcon} ${isActive ? styles.qIconActive : ''} ${isSolved ? styles.qIconSolved : ''}`}>
                  {isSolved ? '✓' : String(idx + 1).padStart(2, '0')}
                </div>
                <div className={styles.qInfo}>
                  <div className={styles.qTitle}>{q.title}</div>
                  <div className={styles.qMeta}>
                    {q.sub_question_count} parts
                  </div>
                </div>
                {isSolved ? (
                  <span className={styles.solvedTag}>SOLVED</span>
                ) : (
                  Number(currentRound) !== 3 && (
                    <span className={styles.qPoints}>{formatPoints(q.total_points)} pts</span>
                  )
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
