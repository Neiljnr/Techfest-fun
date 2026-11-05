import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
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
    setActiveModal, 
    playTone,
    showToast 
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState(() => Array(QUIZ_QUESTIONS.length).fill(-1));
  const [quizFinished, setQuizFinished] = useState(blitzState.completed);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setAnswers(previous => previous.map((answer, index) => index === currentIndex ? -1 : answer));
    playTone('error');
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    setSelectedOption(idx);
    setIsAnswered(true);
    setAnswers(previous => previous.map((answer, index) => index === currentIndex ? idx : answer));
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

  const completeQuiz = async () => {
    setIsSubmitting(true);
    const result = await submitPromptBlitz(answers);
    setIsSubmitting(false);
    if (!result) return;
    setQuizFinished(true);
    if (result.correct_count >= 5) {
      playTone('points');
      confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
    }
    showToast('Quiz scored', `${result.correct_count}/10 correct. ${result.score} points recorded on the server.`, 'success');
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
                10 Questions · 20s Per Question · 10 points per correct answer
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
                    {answers.filter(answer => answer >= 0).length}/10 answered
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
                    Scored by the event server
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
                          background: 'rgba(0, 176, 255, 0.15)',
                          border: '1.5px solid #00B0FF',
                          color: '#FFF'
                        } : {})
                      }}
                    >
                      <span>{opt}</span>
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
                  <button
                    className="pill-btn-action pill-btn-primary"
                    onClick={nextQuestion}
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? 'Submitting…' : currentIndex + 1 === 10 ? 'Submit for Scoring' : 'Next Question'}</span>
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
