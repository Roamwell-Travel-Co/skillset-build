import { useState, useEffect } from 'react'
import { quizzes } from '../../data/quizzes'
import './SkillbitLesson.css'

/* ── Voice engine ─────────────────────────────────────────────────
   Loads voices once after onvoiceschanged fires, then picks the
   best fr-FR voice explicitly so we never fall back to English. */
let _frVoice = null

function loadFrVoice() {
  const all = window.speechSynthesis.getVoices()
  _frVoice = all.find(v => v.lang === 'fr-FR' && v.name === 'Thomas')
    || all.find(v => v.lang === 'fr-FR' && v.name === 'Marie')
    || all.find(v => v.lang === 'fr-FR' && !v.name.includes('('))
    || all.find(v => v.lang === 'fr-FR')
    || null
}

if (window.speechSynthesis.getVoices().length > 0) {
  loadFrVoice()
} else {
  window.speechSynthesis.onvoiceschanged = loadFrVoice
}

function speak(text, rate = 0.85) {
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  u.rate = rate
  if (_frVoice) u.voice = _frVoice
  window.speechSynthesis.speak(u)
}

export default function SkillbitLesson({ tripInfo, onExit }) {
  const questions = quizzes.france
  const [qIndex, setQIndex]       = useState(0)
  const [selected, setSelected]   = useState(null)
  const [tapped, setTapped]       = useState([])
  const [checked, setChecked]     = useState(false)
  const [hearts, setHearts]       = useState(5)
  const [streak, setStreak]       = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone]           = useState(false)
  const [speakerPulse, setSpeakerPulse] = useState(false)

  const q        = questions[qIndex]
  const progress = (qIndex / questions.length) * 100

  // For tap-what-you-hear: pulse the speaker button to invite the user
  // to click it. Browsers block audio not triggered by a direct gesture.
  useEffect(() => {
    setSpeakerPulse(false)
    if (q.type === 'tap-what-you-hear') {
      const t = setTimeout(() => setSpeakerPulse(true), 400)
      return () => clearTimeout(t)
    }
  }, [qIndex])

  function hasAnswer() {
    if (q.type === 'tap-what-you-hear') return tapped.length > 0
    return selected !== null
  }

  function isRight() {
    if (q.type === 'tap-what-you-hear') return tapped.join(' ') === q.correct
    return selected === q.correct
  }

  function handleCheck() {
    if (!hasAnswer() || checked) return
    setChecked(true)
    if (isRight()) {
      setStreak(s => s + 1)
      setCorrectCount(c => c + 1)
    } else {
      setStreak(0)
      setHearts(h => Math.max(0, h - 1))
    }
  }

  function handleContinue() {
    if (qIndex + 1 >= questions.length) { setDone(true); return }
    setQIndex(i => i + 1)
    setSelected(null)
    setTapped([])
    setChecked(false)
  }

  function toggleTile(word) {
    if (checked) return
    setTapped(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word])
  }

  const right = isRight()

  /* ── Done screen ── */
  if (done) {
    const accuracy = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="lesson-done">
        <div className="done-content">
          <img src="/bubbie.png" alt="Bubbie" className="done-bubbie" />
          <h1 className="done-title">Lesson Complete!</h1>
          <p className="done-sub">You're one step closer to {tripInfo?.destination || 'France'}!</p>
          <div className="done-stats">
            <div className="done-stat done-stat--yellow">
              <div className="done-stat-label">TOTAL XP</div>
              <div className="done-stat-val"><span>⚡</span> {correctCount * 5}</div>
            </div>
            <div className="done-stat done-stat--green">
              <div className="done-stat-label">ACCURACY</div>
              <div className="done-stat-val"><span>🎯</span> {accuracy}%</div>
            </div>
          </div>
          <button className="lesson-btn lesson-btn--green" onClick={onExit}>CONTINUE</button>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-wrap">

      {/* ── Top bar ── */}
      <div className="lesson-topbar">
        <button className="lesson-close" onClick={onExit}>✕</button>
        <div className="lesson-topbar-mid">
          {streak >= 2 && (
            <div className={`lesson-streak ${streak >= 5 ? 'lesson-streak--gold' : ''}`}>
              {streak} IN A ROW
            </div>
          )}
          <div className="lesson-progress-track">
            <div className="lesson-progress-fill" style={{ width: `${Math.max(progress, 4)}%` }} />
          </div>
        </div>
        <div className="lesson-hearts">
          <span className="lesson-heart-emoji">❤️</span>
          <span className="lesson-heart-num">{hearts}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="lesson-body">
        {q.type === 'translate'         && <TranslateQ        q={q} selected={selected} checked={checked} onSelect={setSelected} />}
        {q.type === 'select-meaning'    && <SelectMeaningQ    q={q} selected={selected} checked={checked} onSelect={setSelected} />}
        {q.type === 'tap-what-you-hear' && <TapWhatYouHearQ   q={q} tapped={tapped}     checked={checked} onTile={toggleTile} pulse={speakerPulse} onSpeak={() => { setSpeakerPulse(false); speak(q.audio, 0.85) }} />}
        {q.type === 'complete-chat'     && <CompleteChatQ     q={q} selected={selected} checked={checked} onSelect={setSelected} />}
      </div>

      {/* ── Bottom ── */}
      {!checked ? (
        <div className="lesson-bottom">
          <button
            className={`lesson-btn ${hasAnswer() ? 'lesson-btn--green' : 'lesson-btn--gray'}`}
            onClick={handleCheck}
            disabled={!hasAnswer()}
          >CHECK</button>
        </div>
      ) : (
        <div className={`lesson-feedback ${right ? 'lesson-feedback--correct' : 'lesson-feedback--wrong'}`}>
          <div className="lesson-feedback-left">
            <p className="lesson-feedback-label">{right ? '✓ Correct!' : '✗ Incorrect'}</p>
            {!right && <p className="lesson-feedback-answer">{q.correct}</p>}
            <p className="lesson-feedback-hint">{q.feedback}</p>
          </div>
          <button
            className={`lesson-btn ${right ? 'lesson-btn--green' : 'lesson-btn--red'}`}
            onClick={handleContinue}
          >CONTINUE</button>
        </div>
      )}
    </div>
  )
}

/* ── Question type: Translate ── */
function TranslateQ({ q, selected, checked, onSelect }) {
  return (
    <>
      <p className="lesson-instruction">Translate this sentence</p>
      <div className="lesson-prompt">
        <button className="lesson-speaker" onClick={() => speak(q.audio)}>🔊</button>
        <p className="lesson-english">{q.english}</p>
      </div>
      <OptionList q={q} selected={selected} checked={checked} onSelect={onSelect} />
    </>
  )
}

/* ── Question type: Select Meaning ── */
function SelectMeaningQ({ q, selected, checked, onSelect }) {
  return (
    <>
      <p className="lesson-instruction">Select the correct meaning</p>
      <div className="sm-area">
        <img src="/bubbie.png" alt="Bubbie" className="sm-bubbie" />
        <div className="sm-bubble" onClick={() => speak(q.audio)}>
          <button className="sm-speaker">🔊</button>
          <span className="sm-phrase">{q.prompt}</span>
        </div>
      </div>
      <OptionList q={q} selected={selected} checked={checked} onSelect={onSelect} />
    </>
  )
}

/* ── Question type: Tap What You Hear ── */
function TapWhatYouHearQ({ q, tapped, checked, onTile, pulse, onSpeak }) {
  return (
    <>
      <p className="lesson-instruction">Tap what you hear</p>
      <div className="tap-audio-row">
        <button
          className={`tap-btn tap-btn--lg ${pulse ? 'tap-btn--pulse' : ''}`}
          onClick={onSpeak}
        >
          <span>🔊</span>
        </button>
        <button className="tap-btn tap-btn--sm" onClick={() => speak(q.audio, 0.45)}>
          <span style={{fontSize:'16px'}}>🐢</span><span style={{fontSize:'12px'}}>🔊</span>
        </button>
      </div>

      <div className="tap-drop-zone">
        {tapped.length > 0
          ? tapped.map(w => (
              <button key={w} className="tap-tile tap-tile--placed" onClick={() => !checked && onTile(w)}>{w}</button>
            ))
          : <div className="tap-drop-placeholder" />
        }
      </div>
      <div className="tap-divider" />
      <div className="tap-word-bank">
        {q.wordTiles.map(w => (
          <button
            key={w}
            className={`tap-tile ${tapped.includes(w) ? 'tap-tile--used' : ''} ${checked && w === q.correct ? 'tap-tile--correct' : ''}`}
            onClick={() => !checked && onTile(w)}
            disabled={checked}
          >{w}</button>
        ))}
      </div>
    </>
  )
}

/* ── Question type: Complete the Chat ── */
function CompleteChatQ({ q, selected, checked, onSelect }) {
  return (
    <>
      <p className="lesson-instruction">Complete the chat</p>
      <div className="chat-scene">
        <div className="chat-row chat-row--left">
          <img src="/bubbie.png" alt="Bubbie" className="chat-char" />
          <div className="chat-bubble chat-bubble--left">
            <button className="chat-speaker" onClick={() => speak(q.prompt)}>🔊</button>
            <span>{q.prompt}</span>
          </div>
        </div>
        <div className="chat-row chat-row--right">
          <div className={`chat-bubble chat-bubble--right ${selected ? 'chat-bubble--filled' : ''}`}>
            {selected || <span className="chat-blank">___</span>}
          </div>
          <div className="chat-avatar">👤</div>
        </div>
      </div>
      <OptionList q={q} selected={selected} checked={checked} onSelect={onSelect} />
    </>
  )
}

/* ── Shared option list with numbered badges ── */
function OptionList({ q, selected, checked, onSelect }) {
  return (
    <div className="lesson-options">
      {q.options.map((opt, i) => (
        <button
          key={opt}
          className={[
            'lesson-option',
            selected === opt && !checked  ? 'lesson-option--selected' : '',
            checked && opt === q.correct  ? 'lesson-option--correct'  : '',
            checked && selected === opt && opt !== q.correct ? 'lesson-option--wrong' : '',
          ].join(' ')}
          onClick={() => !checked && onSelect(opt)}
          disabled={checked}
        >
          <span className="option-badge">{i + 1}</span>
          <span className="option-text">{opt}</span>
        </button>
      ))}
    </div>
  )
}
