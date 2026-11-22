import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Zap, 
  Clock, 
  Award, 
  ArrowRight
} from 'lucide-react';

export const PromptBlitzModal = () => {
  const { 
    blitzState, 
    submitPromptBlitz,
    fetchQuizQuestions,
    stageSettings,
    setActiveModal, 
    playTone,
    showToast 
  } = useApp();

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(!blitzState.completed);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(blitzState.completed);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFailed, setSubmissionFailed] = useState(false);
  const timerRef = useRef(null);
  const advanceRef = useRef(null);

  const total = questions.length;
  const currentQ = questions[currentIndex];
  const resultScore = result ? result.score : blitzState.score;
  const resultCorrect = result ? result.correct_count : blitzState.correctCount;
  const resultTotal = result ? result.total_answered : (blitzState.totalAnswered || (blitzState.completed ? 10 : Math.max(total, 15)));
  const passed = resultCorrect >= Math.ceil(resultTotal / 2);

  useEffect(() => {
    if (blitzState.completed) return;
    let cancelled = false;
    fetchQuizQuestions().then(list => {
      if (cancelled) return;
      setQuestions(list || []);
      setLoadingQuestions(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (quizFinished || isAnswered || !currentQ) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isAnswered, quizFinished]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearTimeout(advanceRef.current);
  }, []);

  const advanceAfterAnswer = (nextAnswers) => {
    clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => {
      if (currentIndex + 1 < total) {
        setCurrentIndex(index => index + 1);
        setSecondsLeft(20);
        setSelectedOption(null);
        setIsAnswered(false);
        setSubmissionFailed(false);
      } else {
        completeQuiz(nextAnswers);
      }
    }, 450);
  };

  const handleTimeOut = () => {
    if (!currentQ || isAnswered) return;
    const nextAnswers = { ...answers, [currentQ.id]: -1 };
    setIsAnswered(true);
    setSelectedOption(-1);
    setAnswers(nextAnswers);
    playTone('error');
    advanceAfterAnswer(nextAnswers);
  };

  const handleSelectOption = (idx) => {
    if (isAnswered || isSubmitting || !currentQ) return;
    clearInterval(timerRef.current);
    setSelectedOption(idx);
    setIsAnswered(true);
    setSubmissionFailed(false);
    const nextAnswers = { ...answers, [currentQ.id]: idx };
    setAnswers(nextAnswers);
    advanceAfterAnswer(nextAnswers);
  };

  const completeQuiz = async (finalAnswers = answers) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionFailed(false);
    try {
      const scored = await submitPromptBlitz(finalAnswers);
      if (!scored) {
        setSubmissionFailed(true);
        return;
      }
      setResult(scored);
      setQuizFinished(true);
      if (scored.correct_count >= Math.ceil(scored.total_answered / 2)) {
        playTone('points');
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
      }
      showToast('Quiz scored', `${scored.correct_count}/${scored.total_answered} correct. ${scored.score} points recorded.`, 'success');
    } catch {
      setSubmissionFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageOpen = stageSettings[3];

  return (
    <div className="modal-overlay">
      <div 
        className="modal-sheet" 
        style={{ 
          height: '90vh', 
          maxHeight: '90vh',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(31, 173, 61, 0.13), transparent 58%), #02190C',
          borderTop: '2px solid #1FAD3D'
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Zap size={22} color="#B8FF6C" />
            <div>
              <h3 className="modal-title" style={{ fontFamily: "'Bricolage Grotesque', var(--font-heading)" }}>Stage 3: Prompt Blitz</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: "'Feature Mono', ui-monospace, monospace" }}>
                15 questions · 20s each · 10 points per correct answer
              </p>
            </div>
          </div>
          <button 
            className="modal-close-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {!quizFinished && (loadingQuestions || !stageOpen || !currentQ) ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Clock size={32} color="#B8FF6C" />
              <h3 style={{ marginTop: '12px', color: '#FFF' }}>
                {loadingQuestions ? 'Loading questions…' : !stageOpen ? 'Prompt Blitz is not open yet' : 'No questions yet'}
              </h3>
              {!loadingQuestions && (
                <p style={{ fontSize: '13px', marginTop: '6px' }}>
                  {!stageOpen ? 'Wait for the organizers to announce it.' : 'The organizers are still setting up. Check back soon.'}
                </p>
              )}
            </div>
          ) : !quizFinished ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Question Index & Live Score Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <span style={{ fontWeight: '800', color: 'var(--text-light)' }}>
                  Question {currentIndex + 1} of {total}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#B8FF6C" />
                  <span style={{ fontWeight: '800', color: '#B8FF6C' }}>
                    {Object.keys(answers).length}/{total} answered
                  </span>
                </div>
              </div>

              {/* 20-second Countdown Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: secondsLeft <= 5 ? '#FF5252' : 'var(--text-muted)' }}>
                    <Clock size={13} />
                    {secondsLeft}s remaining
                  </span>
                  <span style={{ color: '#B8FF6C', fontWeight: '700' }}>
                    {isSubmitting ? 'Recording your run…' : isAnswered ? 'Answer saved · moving on' : 'Pick one answer to lock it in'}
                  </span>
                </div>

                <div className="progress-bar-shell" style={{ height: '6px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(secondsLeft / 20) * 100}%`,
                      background: secondsLeft <= 5 ? '#FF5252' : '#1FAD3D',
                      transition: 'width 1s linear'
                    }}
                  />
                </div>
              </div>

              {/* Sponsor & Topic badge */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  fontSize: '10.5px',
                  background: 'rgba(184, 255, 108, 0.12)',
                  color: '#B8FF6C',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: '700'
                }}>
                  {currentQ.topic}
                </span>
              </div>

              {/* Question Text */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', lineHeight: 1.4 }}>
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentQ.options.map((opt, idx) => {
                  const optStyle = {
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-white)'
                  };

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        textAlign: 'left',
                        fontSize: '13.5px',
                        cursor: isAnswered ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                        ...optStyle,
                        ...(idx === selectedOption ? {
                          background: 'rgba(31, 173, 61, 0.2)',
                          border: '1.5px solid #B8FF6C',
                          color: '#B8FF6C'
                        } : {})
                      }}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {submissionFailed && currentIndex + 1 === total && (
                <div style={{
                  background: 'rgba(255, 130, 70, 0.1)',
                  border: '1px solid rgba(255, 160, 100, 0.35)',
                  borderRadius: '12px', padding: '14px', color: 'var(--text-light)'
                }}>
                  <p style={{ fontSize: '13px', marginBottom: '10px' }}>Your answers are saved on this screen. We couldn’t record the score just now.</p>
                  <button className="pill-btn-action pill-btn-primary" onClick={() => completeQuiz(answers)} disabled={isSubmitting}>
                    <span>{isSubmitting ? 'Submitting…' : 'Retry score submission'}</span><ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen (B6) */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '20px 10px',
              gap: '16px'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: passed ? 'rgba(31, 173, 61, 0.15)' : 'rgba(184, 255, 108, 0.15)',
                border: `2px solid ${passed ? '#1FAD3D' : '#B8FF6C'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 230, 118, 0.25)'
              }}>
                <Award size={36} color={passed ? '#1FAD3D' : '#B8FF6C'} />
              </div>

              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800' }}>
                  {passed ? 'Prompt Blitz Conquered!' : 'Prompt Blitz Completed'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  {passed
                    ? 'Stage 3 cleared! Fast fingers and sharp minds. You dey move!'
                    : 'Good effort! Blitz can only be officially scored once.'}
                </p>
              </div>

              {/* Score Box */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '20px',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Points Earned
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#B8FF6C', fontFamily: 'var(--font-heading)' }}>
                    +{resultScore}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Correct Answers
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--green-primary)', fontFamily: 'var(--font-heading)' }}>
                    {resultCorrect}/{resultTotal}
                  </div>
                </div>
              </div>

              <button
                className="pill-btn-action pill-btn-primary"
                onClick={() => setActiveModal(null)}
                style={{ width: '100%', marginTop: '10px' }}
              >
                Return to Quest Hub
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
