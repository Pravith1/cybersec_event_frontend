import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoundSummary } from '../services/api';
import Sidebar from '../components/Sidebar';
import QuestionDetail from '../components/QuestionDetail';
import RoundTransition from '../components/RoundTransition';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentRound, setCurrentRound] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Round transition animation state
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [transitionRound, setTransitionRound] = useState(null);

  const fetchRound = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRoundSummary();
      setCurrentRound(res.data.current_round);
      setQuestions(res.data.questions || []);
      // Select first question if none active
      if (!activeQuestionId && res.data.questions?.length > 0) {
        setActiveQuestionId(res.data.questions[0].question_id);
      }
    } catch (err) {
      console.error('Failed to fetch round summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRound();
  }, [fetchRound]);

  // Called after a successful answer submission
  const handleAnswerResult = (result) => {
    if (result.current_round !== undefined && result.current_round !== currentRound) {
      // Round changed! Show transition
      setTransitionRound(result.current_round);
      setShowRoundTransition(true);
    }
  };

  const handleRoundTransitionEnd = () => {
    setShowRoundTransition(false);
    setCurrentRound(transitionRound);
    setActiveQuestionId(null);
    fetchRound();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={styles.dashboard}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.logo}>
            CIPHER<span className={styles.logoAccent}>CLASH</span>
          </span>
          {currentRound && (
            <div className={styles.roundBadge}>
              <span className={styles.roundDot} />
              ROUND {currentRound}
            </div>
          )}
        </div>

        <div className={styles.topRight}>
          <Link to="/dashboard" className={`${styles.navBtn} ${styles.navBtnActive}`}>
            QUESTIONS
          </Link>
          <Link to="/leaderboard" className={styles.navBtn}>
            LEADERBOARD
          </Link>
          <span className={styles.username}>
            {user?.username || 'AGENT'}
          </span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className={styles.mainArea}>
        <Sidebar
          questions={questions}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={setActiveQuestionId}
          loading={loading}
          currentRound={currentRound}
        />

        <div className={styles.contentWrap}>
          {activeQuestionId ? (
            <QuestionDetail
              questionId={activeQuestionId}
              currentRound={currentRound}
              onAnswerResult={handleAnswerResult}
              onQuestionCompleted={fetchRound}
            />
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
              color: 'var(--text-muted)', letterSpacing: '0.1em'
            }}>
              {loading ? '[ LOADING... ]' : '[ SELECT A QUESTION ]'}
            </div>
          )}

          {/* Round transition overlay */}
          {showRoundTransition && (
            <RoundTransition
              round={transitionRound}
              onComplete={handleRoundTransitionEnd}
            />
          )}
        </div>
      </div>
    </div>
  );
}
