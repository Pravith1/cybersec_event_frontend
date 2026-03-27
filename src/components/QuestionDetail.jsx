import { useState, useEffect, useCallback } from 'react';
import { getCurrentSubQuestion, submitAnswer } from '../services/api';
import styles from './QuestionDetail.module.css';

export default function QuestionDetail({ questionId, currentRound, onAnswerResult, onQuestionCompleted }) {
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Part transition state
  const [showPartTransition, setShowPartTransition] = useState(false);
  const [partTransitionInfo, setPartTransitionInfo] = useState(null);

  const fetchQuestion = useCallback(async () => {
    if (!questionId) return;
    try {
      setLoading(true);
      setFeedback(null);
      setAnswer('');
      setHint('');
      const res = await getCurrentSubQuestion(questionId);

      if (res.data.question_completed) {
        setIsCompleted(true);
        setQuestionData({ title: res.data.title, question_id: questionId });
      } else {
        setIsCompleted(false);
        setQuestionData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch question:', err);
      setFeedback({ type: 'info', message: err.response?.data?.message || 'Failed to load question.' });
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  // Determine field mode based on round and step
  const isRound3 = currentRound === 3;
  const isLastPart = questionData && questionData.current_step === questionData.total_steps;
  const showDualFields = isRound3 && !isLastPart && !isCompleted;

  const handleSubmitHint = async (e) => {
    e.preventDefault();
    if (!hint.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await submitAnswer({ questionId, answer: hint.trim() });
      console.log(res);
      const data = res.data;

      if (data.correct) {
        setFeedback({ type: 'correct', message: data.message });
        setHint('');
        setAnswer('');

        // Check for round change
        if (data.current_round !== undefined) {
          onAnswerResult(data);
        }

        if (data.question_completed) {
          setIsCompleted(true);
          if (onQuestionCompleted) onQuestionCompleted();
        } else {
          // Part transition (Round 3 hint correct → next part)
          triggerPartTransition(questionData.current_step, data.next_step);
        }
      } else {
        setFeedback({ type: 'incorrect', message: data.message || 'Incorrect. Try again!' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed.';
      if (msg.toLowerCase().includes('already completed')) {
        setIsCompleted(true);
        setFeedback({ type: 'info', message: msg });
      } else {
        setFeedback({ type: 'incorrect', message: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      // Determine the body based on round
      let body;
      if (isRound3 && !isLastPart) {
        // This is the final_answer field in round 3 (not last part → still send as final_answer)
        body = { questionId, final_answer: answer.trim() };
      } else if (isRound3 && isLastPart) {
        // Last part of round 3: only one answer field, send as final_answer
        body = { questionId, final_answer: answer.trim() };
      } else {
        // Rounds 1, 2, 4: regular answer
        body = { questionId, answer: answer.trim() };
      }

      const res = await submitAnswer(body);
      const data = res.data;

      if (data.correct) {
        setFeedback({ type: 'correct', message: data.message });
        setAnswer('');
        setHint('');

        // Check for round change
        if (data.current_round !== undefined) {
          onAnswerResult(data);
        }

        if (data.question_completed) {
          setIsCompleted(true);
          if (onQuestionCompleted) onQuestionCompleted();
        } else {
          // Part transition (Round 4 answer correct → next part, or others)
          triggerPartTransition(questionData.current_step, data.next_step);
        }
      } else {
        setFeedback({ type: 'incorrect', message: data.message || 'Incorrect. Try again!' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed.';
      if (msg.toLowerCase().includes('already completed')) {
        setIsCompleted(true);
        setFeedback({ type: 'info', message: msg });
      } else {
        setFeedback({ type: 'incorrect', message: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const triggerPartTransition = (fromStep, toStep) => {
    setPartTransitionInfo({ from: fromStep, to: toStep });
    setShowPartTransition(true);
    setTimeout(() => {
      setShowPartTransition(false);
      setPartTransitionInfo(null);
      fetchQuestion(); // Reload the next part
    }, 1800);
  };

  if (loading) {
    return <div className={styles.loadingState}>[ DECRYPTING QUESTION... ]</div>;
  }

  return (
    <div className={styles.detail}>
      {/* Question header */}
      <div className={styles.questionHeader}>
        <div className={styles.questionTag}>
          ◆ QUESTION
          {questionData?.current_step !== undefined && !isCompleted && (
            <span className={styles.stepBadge}>
              PART {questionData.current_step + 1} / {questionData.total_steps}
            </span>
          )}
        </div>
        <h2 className={styles.questionTitle}>
          <span className={styles.titleAccent}>{questionData?.title || 'Unknown'}</span>
        </h2>
        {isCompleted && (
          <div className={styles.completedBadge}>✓ QUESTION COMPLETED</div>
        )}
      </div>

      {/* Content area */}
      <div className={styles.contentArea}>
        {!isCompleted && questionData?.sub_question && (
          <>
            <div className={styles.subQuestion}>
              {questionData.sub_question}
            </div>

            {questionData.image && (
              <img
                className={styles.questionImage}
                src={questionData.image}
                alt="Question visual"
              />
            )}
          </>
        )}

        {/* Answer section */}
        {!isCompleted && questionData?.sub_question && (
          <div className={styles.answerSection}>
            {showDualFields ? (
              /* Round 3, not last part: dual fields */
              <div className={styles.answerForm}>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelHint}>⟡ </span>HINT ANSWER
                    </label>
                    <input
                      className={`${styles.input} ${styles.inputHint}`}
                      type="text"
                      placeholder="Enter hint..."
                      value={hint}
                      onChange={(e) => setHint(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelPrefix}>$ </span>FINAL ANSWER
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Enter final answer..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className={styles.btnRow}>
                  <button
                    className={`${styles.submitBtn} ${styles.hintBtn}`}
                    onClick={handleSubmitHint}
                    disabled={submitting || !hint.trim()}
                  >
                    {submitting ? <span className={styles.spinner} /> : null}
                    SUBMIT HINT →
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                  >
                    {submitting ? <span className={styles.spinner} /> : null}
                    SUBMIT ANSWER →
                  </button>
                </div>
              </div>
            ) : (
              /* All other rounds / Round 3 last part: single field */
              <form className={styles.answerForm} onSubmit={handleSubmitAnswer}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelPrefix}>$ </span>
                    {isRound3 && isLastPart ? 'FINAL ANSWER' : 'YOUR ANSWER'}
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder={isRound3 && isLastPart ? 'Enter the final answer...' : 'Enter your answer...'}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className={styles.btnRow}>
                  <button
                    className={styles.submitBtn}
                    type="submit"
                    disabled={submitting || !answer.trim()}
                  >
                    {submitting ? <span className={styles.spinner} /> : null}
                    SUBMIT →
                  </button>
                </div>
              </form>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`${styles.feedback} ${feedback.type === 'correct' ? styles.feedbackCorrect :
                  feedback.type === 'incorrect' ? styles.feedbackIncorrect :
                    styles.feedbackInfo
                }`}>
                {feedback.type === 'correct' ? '✓ ' : feedback.type === 'incorrect' ? '✗ ' : 'ℹ '}
                {feedback.message}
              </div>
            )}
          </div>
        )}

        {/* Completed state answer blocked */}
        {isCompleted && (
          <div className={styles.answerSection}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelPrefix}>$ </span>ANSWER
              </label>
              <input
                className={`${styles.input} ${styles.inputDisabled}`}
                type="text"
                placeholder="Question already solved"
                disabled
              />
            </div>
          </div>
        )}

        {/* Part transition overlay (only covers content, NOT sidebar) */}
        {showPartTransition && partTransitionInfo && (
          <div className={styles.partTransitionOverlay}>
            <div className={styles.partTransitionText}>
              PART {partTransitionInfo.from + 1} → PART {partTransitionInfo.to + 1}
            </div>
            <div className={styles.partTransitionSub}>
              // loading next sub-question...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
