import { useState, useEffect } from 'react'
import { quizzes } from '../../data/quizzes'
import './SkillbitLesson.css'

/* ── Language detection ──────────────────────────────────────────
   Maps destination text to a BCP-47 language tag for TTS.        */
function detectLang(destination) {
  const d = (destination || '').toLowerCase()
  if (/japan|tokyo|osaka|kyoto/.test(d))                           return 'ja-JP'
  if (/germany|berlin|munich|hamburg|austria|vienna/.test(d))      return 'de-DE'
  if (/spain|madrid|barcelona|mexico|colombia|argentina|peru|chile|cuba/.test(d)) return 'es-ES'
  if (/italy|rome|milan|naples|florence|venice/.test(d))           return 'it-IT'
  if (/portugal|lisbon|brazil|brasil|rio/.test(d))                 return 'pt-BR'
  if (/china|beijing|shanghai|mandarin/.test(d))                   return 'zh-CN'
  if (/korea|seoul|busan/.test(d))                                 return 'ko-KR'
  if (/russia|moscow|saint pete/.test(d))                          return 'ru-RU'
  if (/netherlands|amsterdam/.test(d))                             return 'nl-NL'
  if (/sweden|stockholm/.test(d))                                  return 'sv-SE'
  if (/norway|oslo/.test(d))                                       return 'nb-NO'
  if (/denmark|copenhagen/.test(d))                                return 'da-DK'
  if (/turkey|istanbul|ankara/.test(d))                            return 'tr-TR'
  if (/thailand|bangkok/.test(d))                                  return 'th-TH'
  if (/hindi|india|delhi|mumbai/.test(d))                          return 'hi-IN'
  if (/arabic|saudi|egypt|dubai|uae|morocco/.test(d))              return 'ar-SA'
  if (/greek|greece|athens/.test(d))                               return 'el-GR'
  if (/polish|poland|warsaw/.test(d))                              return 'pl-PL'
  return 'fr-FR'
}

/* ── Voice engine ────────────────────────────────────────────────
   Picks the best available voice for a given language tag.        */
function speak(text, lang = 'fr-FR', rate = 0.85) {
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = rate
  const voices = window.speechSynthesis.getVoices()
  const prefix = lang.split('-')[0]
  u.voice = voices.find(v => v.lang === lang && !v.name.includes('('))
    || voices.find(v => v.lang === lang)
    || voices.find(v => v.lang.startsWith(prefix))
    || null
  window.speechSynthesis.speak(u)
}

// Trigger voice list load so onvoiceschanged fires
if (window.speechSynthesis.getVoices().length === 0) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
}

/* ── Confetti ────────────────────────────────────────────────── */
const CONFETTI_COLORS = ['#58cc02','#ffd900','#ff9600','#1cb0f6','#ff4b4b','#ce82ff','#ffffff']
function Confetti({ active }) {
  if (!active) return null
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 90,
    delay: Math.random() * 0.5,
    duration: 1.2 + Math.random() * 1.2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    w: 7 + Math.random() * 9,
    h: 4 + Math.random() * 5,
    rotate: Math.random() * 360,
  }))
  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          background: p.color,
          width: p.w,
          height: p.h,
          transform: `rotate(${p.rotate}deg)`,
        }} />
      ))}
    </div>
  )
}

/* ── XP popup ────────────────────────────────────────────────── */
function XPPopup({ show }) {
  if (!show) return null
  return <div className="xp-popup">+5 ⚡</div>
}

/* ── Bubbie reaction ─────────────────────────────────────────── */
function BubbieReaction({ reaction }) {
  if (!reaction) return null
  return (
    <div className={`bubbie-react bubbie-react--${reaction}`} aria-hidden="true">
      <img src="/bubbie.png" alt="" />
      <span className="bubbie-react-emoji">{reaction === 'correct' ? '🎉' : '😟'}</span>
    </div>
  )
}

/* ── Scene label for chat questions ─────────────────────────── */
function getSceneLabel(prompt) {
  const p = (prompt || '').toLowerCase()
  if (/caf[eé]|coffee|kaffee|caffè|café|désirez|möchten|desidera|desea|order|menu/.test(p)) return '☕ At the café'
  if (/billet|ticket|train|gare|bahnhof|station|zug|treno/.test(p)) return '🚆 At the station'
  if (/combien|how much|addition|rechnung|conto|bill|pay|pagar/.test(p)) return '💳 Paying the bill'
  if (/direction|where|où|wo|dónde|dove|where is/.test(p)) return '🗺️ Asking directions'
  if (/h[oô]tel|chambre|room|zimmer|camera|habitaci/.test(p)) return '🏨 At the hotel'
  if (/marché|market|buy|acheter|comprar|compro/.test(p)) return '🛍️ At the market'
  if (/sumimasen|irasshaimase|kudasai|sushi|ramen/.test(p)) return '🍣 At the restaurant'
  if (/bier|beer|pub|bar|prost|cheers/.test(p)) return '🍺 At the bar'
  return '🌍 Real conversation'
}

/* ── Main component ──────────────────────────────────────────── */
export default function SkillbitLesson({ tripInfo, questions: propQuestions, onExit, onComplete }) {
  const questions = propQuestions || quizzes.france
  const lang      = detectLang(tripInfo?.destination)

  const [qIndex, setQIndex]           = useState(0)
  const [selected, setSelected]       = useState(null)
  const [tapped, setTapped]           = useState([])
  const [checked, setChecked]         = useState(false)
  const [hearts, setHearts]           = useState(5)
  const [streak, setStreak]           = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone]               = useState(false)
  const [speakerPulse, setSpeakerPulse] = useState(false)
  const [reaction, setReaction]       = useState(null)
  const [showXP, setShowXP]           = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const q        = questions[qIndex]
  const progress = (qIndex / questions.length) * 100

  useEffect(() => {
    setSpeakerPulse(false)
    setReaction(null)
    setShowXP(false)
    setShowConfetti(false)
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
    const right = isRight()
    setReaction(right ? 'correct' : 'wrong')
    if (right) {
      setStreak(s => s + 1)
      setCorrectCount(c => c + 1)
      setShowConfetti(true)
      setShowXP(true)
      setTimeout(() => setShowXP(false), 1400)
      setTimeout(() => setShowConfetti(false), 2200)
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
    setReaction(null)
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
        <Confetti active />
        <div className="done-content">
          <img src="/bubbie.png" alt="Bubbie" className="done-bubbie" />
          <h1 className="done-title">Lesson Complete!</h1>
          <p className="done-sub">You're one step closer to {tripInfo?.destination || 'your destination'}!</p>
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
          <button
            className="lesson-btn lesson-btn--green"
            onClick={() => (onComplete ? onComplete(correctCount * 5) : onExit())}
          >CONTINUE</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`lesson-wrap ${checked && !right ? 'lesson-wrap--shake' : ''}`}>
      <Confetti active={showConfetti} />
      <XPPopup show={showXP} />
      <BubbieReaction reaction={reaction} />

      {/* ── Top bar ── */}
      <div className="lesson-topbar">
        <button className="lesson-close" onClick={onExit}>✕</button>
        <div className="lesson-topbar-mid">
          {streak >= 2 && (
            <div className={`lesson-streak ${streak >= 5 ? 'lesson-streak--gold' : ''}`}>
              🔥 {streak} IN A ROW
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
        {q.type === 'translate'         && <TranslateQ      q={q} selected={selected} checked={checked} onSelect={setSelected} lang={lang} />}
        {q.type === 'select-meaning'    && <SelectMeaningQ  q={q} selected={selected} checked={checked} onSelect={setSelected} lang={lang} />}
        {q.type === 'tap-what-you-hear' && <TapWhatYouHearQ q={q} tapped={tapped} checked={checked} onTile={toggleTile} pulse={speakerPulse} lang={lang}
            onSpeak={() => { setSpeakerPulse(false); speak(q.audio, lang, 0.85) }} />}
        {q.type === 'complete-chat'     && <CompleteChatQ   q={q} selected={selected} checked={checked} onSelect={setSelected} lang={lang} />}
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

/* ── Translate ── */
function TranslateQ({ q, selected, checked, onSelect, lang }) {
  return (
    <>
      <p className="lesson-instruction">Translate this sentence</p>
      <div className="lesson-prompt">
        <button className="lesson-speaker" onClick={() => speak(q.audio, lang)}>🔊</button>
        <p className="lesson-english">{q.english}</p>
      </div>
      <OptionList q={q} selected={selected} checked={checked} onSelect={onSelect} />
    </>
  )
}

/* ── Select Meaning ── */
function SelectMeaningQ({ q, selected, checked, onSelect, lang }) {
  return (
    <>
      <p className="lesson-instruction">Select the correct meaning</p>
      <div className="sm-area">
        <img src="/bubbie.png" alt="Bubbie" className="sm-bubbie" />
        <div className="sm-bubble" onClick={() => speak(q.audio, lang)}>
          <button className="sm-speaker">🔊</button>
          <span className="sm-phrase">{q.prompt}</span>
        </div>
      </div>
      <OptionList q={q} selected={selected} checked={checked} onSelect={onSelect} />
    </>
  )
}

/* ── Tap What You Hear ── */
function TapWhatYouHearQ({ q, tapped, checked, onTile, pulse, onSpeak, lang }) {
  return (
    <>
      <p className="lesson-instruction">Tap what you hear</p>
      <div className="tap-audio-row">
        <button className={`tap-btn tap-btn--lg ${pulse ? 'tap-btn--pulse' : ''}`} onClick={onSpeak}>
          <span>🔊</span>
        </button>
        <button className="tap-btn tap-btn--sm" onClick={() => speak(q.audio, lang, 0.45)}>
          <span style={{fontSize:'16px'}}>🐢</span><span style={{fontSize:'12px'}}>🔊</span>
        </button>
      </div>
      <div className="tap-drop-zone">
        {tapped.length > 0
          ? tapped.map(w => <button key={w} className="tap-tile tap-tile--placed" onClick={() => !checked && onTile(w)}>{w}</button>)
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

/* ── Complete the Chat ── */
function CompleteChatQ({ q, selected, checked, onSelect, lang }) {
  return (
    <>
      <p className="lesson-instruction">Complete the chat</p>
      <div className="chat-scene-label">{getSceneLabel(q.prompt)}</div>
      <div className="chat-scene">
        <div className="chat-row chat-row--left">
          <img src="/bubbie.png" alt="Local" className="chat-char chat-char--talking" />
          <div className="chat-bubble chat-bubble--left">
            <button className="chat-speaker" onClick={() => speak(q.prompt, lang)}>🔊</button>
            <span>{q.prompt}</span>
          </div>
        </div>
        <div className="chat-row chat-row--right">
          <div className={`chat-bubble chat-bubble--right ${selected ? 'chat-bubble--filled' : ''}`}>
            {selected || <span className="chat-blank">___</span>}
          </div>
          <div className="chat-avatar">🧑‍💼</div>
        </div>
      </div>
      <OptionList q={q} selected={selected} checked={checked} onSelect={onSelect} />
    </>
  )
}

/* ── Shared option list ── */
function OptionList({ q, selected, checked, onSelect }) {
  return (
    <div className="lesson-options">
      {q.options.map((opt, i) => {
        const isSelected = selected === opt
        const isCorrect  = checked && opt === q.correct
        const isWrong    = checked && isSelected && opt !== q.correct
        return (
          <button
            key={opt}
            className={[
              'lesson-option',
              isSelected && !checked ? 'lesson-option--selected' : '',
              isCorrect              ? 'lesson-option--correct lesson-option--bounce' : '',
              isWrong                ? 'lesson-option--wrong lesson-option--shake' : '',
            ].join(' ')}
            onClick={() => !checked && onSelect(opt)}
            disabled={checked}
          >
            <span className="option-badge">{i + 1}</span>
            <span className="option-text">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
