import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Unlock, Trash2, Save, PlusCircle } from 'lucide-react';

const STAGES = [
  { stage: 1, name: 'Arrival & Check-in' },
  { stage: 2, name: 'Plug & Network' },
  { stage: 3, name: 'Prompt Blitz (Quiz)' },
  { stage: 4, name: 'Industry Integration' }
];

const inputStyle = {
  width: '100%',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '9px 10px',
  color: '#FFF',
  fontSize: '13px',
  outline: 'none'
};

export const StageControl = () => {
  const { stageSettings, setStageActive } = useApp();
  const [busy, setBusy] = useState(null);

  const toggle = async (stage) => {
    const next = !stageSettings[stage];
    if (next && !window.confirm(`Open Stage ${stage}? Every attendee will get a notification.`)) return;
    setBusy(stage);
    await setStageActive(stage, next);
    setBusy(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
        Attendees cannot score in a stage until you open it. Opening a stage notifies everyone.
      </p>
      {STAGES.map(({ stage, name }) => {
        const open = !!stageSettings[stage];
        return (
          <div key={stage} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${open ? 'rgba(0, 230, 118, 0.4)' : 'var(--border-subtle)'}`
          }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px' }}>Stage {stage}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{name}</div>
            </div>
            <button
              onClick={() => toggle(stage)}
              disabled={busy === stage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                border: 'none',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer',
                background: open ? 'var(--green-primary)' : 'rgba(255, 255, 255, 0.1)',
                color: open ? '#000' : '#FFF'
              }}
            >
              {open ? <Unlock size={14} /> : <Lock size={14} />}
              {open ? 'Open' : 'Closed'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const emptyDraft = () => ({
  id: null,
  sort_order: 0,
  topic: '',
  question: '',
  options: ['', '', '', ''],
  correct_index: 0,
  explanation: '',
  active: true
});

export const QuizManager = () => {
  const { staffQuizQuestions, saveQuizQuestion, deleteQuizQuestion, showToast } = useApp();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    const next = Math.max(0, ...staffQuizQuestions.map(q => q.sort_order || 0)) + 1;
    setDraft({ ...emptyDraft(), sort_order: next });
  };

  const setOption = (index, value) => {
    setDraft(previous => ({ ...previous, options: previous.options.map((o, i) => i === index ? value : o) }));
  };

  const save = async () => {
    if (!draft.question.trim() || draft.options.some(o => !o.trim())) {
      showToast('Incomplete question', 'Enter the question and all four options.', 'warning');
      return;
    }
    setSaving(true);
    const ok = await saveQuizQuestion(draft);
    setSaving(false);
    if (ok) setDraft(null);
  };

  const remove = async (question) => {
    if (!window.confirm('Delete this question?')) return;
    await deleteQuizQuestion(question.id);
    if (draft?.id === question.id) setDraft(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button className="pill-btn-action pill-btn-primary" onClick={startNew}>
        <PlusCircle size={16} />
        <span>Add question</span>
      </button>

      {draft && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(255, 215, 0, 0.06)',
          border: '1px solid rgba(255, 215, 0, 0.35)'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={inputStyle} placeholder="Topic" value={draft.topic}
              onChange={e => setDraft({ ...draft, topic: e.target.value })} />
            <input style={{ ...inputStyle, width: '90px' }} type="number" placeholder="Order" value={draft.sort_order}
              onChange={e => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
          </div>
          <textarea style={{ ...inputStyle, minHeight: '60px' }} placeholder="Question" value={draft.question}
            onChange={e => setDraft({ ...draft, question: e.target.value })} />
          {draft.options.map((option, index) => (
            <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" name="correct" checked={draft.correct_index === index}
                onChange={() => setDraft({ ...draft, correct_index: index })} />
              <input style={inputStyle} placeholder={`Option ${index + 1}${draft.correct_index === index ? ' (correct)' : ''}`}
                value={option} onChange={e => setOption(index, e.target.value)} />
            </label>
          ))}
          <input style={inputStyle} placeholder="Explanation (optional)" value={draft.explanation || ''}
            onChange={e => setDraft({ ...draft, explanation: e.target.value })} />
          <label style={{ fontSize: '12.5px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} />
            Active (shown to attendees)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="pill-btn-action pill-btn-primary" onClick={save} disabled={saving}>
              <Save size={15} />
              <span>{saving ? 'Saving…' : 'Save'}</span>
            </button>
            <button className="pill-btn-action" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </div>
      )}

      {staffQuizQuestions.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No questions yet.</p>
      )}

      {staffQuizQuestions.map(question => (
        <div key={question.id} style={{
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          opacity: question.active ? 1 : 0.55
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            #{question.sort_order} · {question.topic || 'General'}{question.active ? '' : ' · inactive'}
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: '700', margin: '4px 0' }}>{question.question}</div>
          <div style={{ fontSize: '12px', color: 'var(--green-primary)' }}>
            Answer: {question.options?.[question.correct_index]}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="pill-btn-action" style={{ width: 'auto', padding: '6px 12px' }}
              onClick={() => setDraft({ ...question })}>Edit</button>
            <button className="pill-btn-action" style={{ width: 'auto', padding: '6px 12px', color: '#FF5252' }}
              onClick={() => remove(question)}><Trash2 size={13} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};
