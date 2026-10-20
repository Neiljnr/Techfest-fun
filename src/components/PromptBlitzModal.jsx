import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_QUESTIONS, calculateBlitzScore } from '../data/quizQuestions';
import confetti from 'canvas-confetti';
import { 
  X, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PromptBlitzModal = () => {
  const { 
    blitzState, 
    setBlitzState, 
    addPoints, 
    setActiveModal, 
    playTone,
    showToast 
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [quizFinished, setQuizFinished] = useState(blitzState.completed);
  const timerRef = useRef(null);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (quizFinished || isAnswered) return;

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

  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedOption(-1); // Timed out
    playTone('error');
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      const qScore = calculateBlitzScore(secondsLeft);
      setSessionScore(prev => prev + qScore);
      setSessionCorrect(prev => prev + 1);
      playTone('points');
    } else {
      playTone('error');
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setSecondsLeft(20);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz complete!
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setQuizFinished(true);
    const finalScore = sessionScore;
    const finalCorrect = sessionCorrect;

    setBlitzState({
      completed: true,
      score: finalScore,
      correctCount: finalCorrect,
      totalAnswered: 10,
      completedAt: new Date().toLocaleTimeString()
    });

    // Add points to ledger
    addPoints(
      'prompt-blitz-final',
      'Prompt Blitz AI Quiz',
      finalScore,
      3,
      `Prompt Blitz Completed: ${finalCorrect}/10 correct with speed bonuses`
    );

    if (finalCorrect >= 5) {
      playTone('stage_clear');
      confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
      showToast('Stage 3 Cleared!', `Prompt Blitz passed with ${finalCorrect}/10 correct. You dey move!`, 'success');
    }
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-sheet" 
        style={{ 
          height: '90vh', 
          maxHeight: '90vh',
          background: '#0B0F0D',
          borderTop: '2px solid #FFD700'
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Zap size={22} color="#FFD700" />
            <div>
              <h3 className="modal-title">Stage 3: Prompt Blitz</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                10 Questions · 20s Per Question · Speed-Weighted Points
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
          {!quizFinished ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Question Index & Live Score Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <span style={{ fontWeight: '800', color: 'var(--text-light)' }}>
                  Question {currentIndex + 1} of 10
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#FFD700" />
                  <span style={{ fontWeight: '800', color: '#FFD700' }}>
                    {sessionScore} PTS
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
                  <span style={{ color: 'var(--green-primary)', fontWeight: '700' }}>
                    Potential: +{calculateBlitzScore(secondsLeft)} pts
                  </span>
                </div>

                <div className="progress-bar-shell" style={{ height: '6px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(secondsLeft / 20) * 100}%`,
                      background: secondsLeft <= 5 ? '#FF5252' : '#FFD700',
                      transition: 'width 1s linear'
                    }}
                  />
                </div>
              </div>

              {/* Sponsor & Topic badge */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  fontSize: '10.5px',
                  background: 'rgba(255, 215, 0, 0.15)',
                  color: '#FFD700',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: '700'
                }}>
                  {currentQ.topic}
                </span>
                <span style={{
                  fontSize: '10.5px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  Sponsored by {currentQ.sponsor}
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
                  let optStyle = {
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-white)'
                  };

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optStyle = {
                        background: 'rgba(0, 230, 118, 0.15)',
                        border: '1.5px solid #00E676',
                        color: '#FFF'
                      };
                    } else if (idx === selectedOption) {
                      optStyle = {
                        background: 'rgba(255, 82, 82, 0.15)',
                        border: '1.5px solid #FF5252',
                        color: '#FFF'
                      };
                    }
                  }

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
                        ...optStyle
                      }}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle size={18} color="#00E676" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                        <XCircle size={18} color="#FF5252" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next button */}
              {isAnswered && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-light)', lineHeight: 1.4 }}>
                    <strong>Insight:</strong> {currentQ.explanation}
                  </p>
                  <button
                    className="pill-btn-action pill-btn-primary"
                    onClick={nextQuestion}
                  >
                    <span>{currentIndex + 1 === 10 ? 'Finish Blitz & View Results' : 'Next Question'}</span>
                    <ArrowRight size={16} />
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
                background: blitzState.correctCount >= 5 ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 215, 0, 0.15)',
                border: `2px solid ${blitzState.correctCount >= 5 ? '#00E676' : '#FFD700'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 230, 118, 0.25)'
              }}>
                <Award size={36} color={blitzState.correctCount >= 5 ? '#00E676' : '#FFD700'} />
              </div>

              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800' }}>
                  {blitzState.correctCount >= 5 ? 'Prompt Blitz Conquered!' : 'Prompt Blitz Completed'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  {blitzState.correctCount >= 5
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
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#FFD700', fontFamily: 'var(--font-heading)' }}>
                    +{blitzState.score}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Correct Answers
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--green-primary)', fontFamily: 'var(--font-heading)' }}>
                    {blitzState.correctCount}/10
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
