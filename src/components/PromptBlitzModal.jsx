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
  const timerRef = useRef(null);

  const total = questions.length;
  const currentQ = questions[currentIndex];
  const resultScore = result ? result.score : blitzState.score;
  const resultCorrect = result ? result.correct_count : blitzState.correctCount;
  const resultTotal = result ? result.total_answered : Math.max(total, 10);
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
    setAnswers(previous => ({ ...previous, [currentQ.id]: idx }));
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < total) {
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
    const scored = await submitPromptBlitz(answers);
    setIsSubmitting(false);
    if (!scored) return;
    setResult(scored);
    setQuizFinished(true);
    if (scored.correct_count >= Math.ceil(total / 2)) {
      playTone('points');
      confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 } });
    }
    showToast('Quiz scored', `${scored.correct_count}/${total} correct. ${scored.score} points recorded.`, 'success');
  };

  const stageOpen = stageSettings[3];

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
                20s per question · 10 points per correct answer
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
              <Clock size={32} color="#FFD700" />
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
                  <Award size={16} color="#FFD700" />
                  <span style={{ fontWeight: '800', color: '#FFD700' }}>
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
                    <span>{isSubmitting ? 'Submitting…' : currentIndex + 1 === total ? 'Submit for Scoring' : 'Next Question'}</span>
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
                background: passed ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 215, 0, 0.15)',
                border: `2px solid ${passed ? '#00E676' : '#FFD700'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 230, 118, 0.25)'
              }}>
                <Award size={36} color={passed ? '#00E676' : '#FFD700'} />
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
                  <div style={{ fontSize: '26px', fontWeight: '800', color: '#FFD700', fontFamily: 'var(--font-heading)' }}>
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
