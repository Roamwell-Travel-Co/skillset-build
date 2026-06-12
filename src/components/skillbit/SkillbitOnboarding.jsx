import { useState } from 'react'
import './SkillbitOnboarding.css'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function daysBetween(date) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const diff = date - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function CalendarPicker({ onSelect }) {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)

  const firstDay  = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1))

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0);  setYear(y => y + 1) } else setMonth(m => m + 1) }

  function pick(day) {
    if (!day) return
    const d = new Date(year, month, day)
    if (d < new Date()) return
    setSelected(day)
  }

  const today = new Date()

  return (
    <div className="calendar">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-title">{MONTHS[month]} {year}</span>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="cal-dow">{d}</div>)}
        {cells.map((day, i) => {
          const d = day ? new Date(year, month, day) : null
          const isPast = d && d < today
          const isSelected = day === selected
          return (
            <div
              key={i}
              className={`cal-day ${!day ? 'cal-day--empty' : ''} ${isPast ? 'cal-day--past' : ''} ${isSelected ? 'cal-day--selected' : ''}`}
              onClick={() => pick(day)}
            >
              {day}
            </div>
          )
        })}
      </div>
      {selected && (
        <button className="onboarding-btn cal-confirm-btn" onClick={() => onSelect(new Date(year, month, selected))}>
          Confirm date →
        </button>
      )}
    </div>
  )
}

export default function SkillbitOnboarding({ onComplete }) {
  const [step, setStep]           = useState('logo')
  const [animating, setAnimating] = useState(false)
  const [destination, setDestination] = useState('')
  const [tripDate, setTripDate]   = useState(null)
  const [interests, setInterests] = useState('')

  function go(next) {
    setAnimating(true)
    setTimeout(() => { setStep(next); setAnimating(false) }, 320)
  }

  function handleDateSelect(date) {
    setTripDate(date)
    go('confirm')
  }

  function handleFinish() {
    onComplete({ destination, tripDate, interests })
  }

  const days = tripDate ? daysBetween(tripDate) : 0
  const destLabel = destination || 'France'

  return (
    <div className="onboarding-overlay">
      <div className={`onboarding-content ${animating ? 'fade-out' : 'fade-in'}`}>

        {/* ── Screen 1: Logo ── */}
        {step === 'logo' && (
          <div className="screen-logo">
            <div className="logo-pop">
              <span className="logo-text">SkillBit</span>
            </div>
            <p className="logo-tagline">A new feature by Duolingo</p>
            <button className="onboarding-btn" onClick={() => go('problem')}>Let's see it →</button>
          </div>
        )}

        {/* ── Screen 2: Problem ── */}
        {step === 'problem' && (
          <div className="screen-bubbie">
            <div className="speech-bubble">
              <p>Hey! I'm Bubbie! 👋 Heading abroad soon? Most travelers land and can't handle a single conversation — not because they're not smart, but because they ran out of time to prepare.</p>
            </div>
            <div className="bubbie-wrap">
              <img src="/bubbie.png" alt="Bubbie" className="bubbie-img" />
            </div>
            <button className="onboarding-btn" onClick={() => go('solution')}>Next →</button>
          </div>
        )}

        {/* ── Screen 3: Solution ── */}
        {step === 'solution' && (
          <div className="screen-bubbie">
            <div className="speech-bubble">
              <p>SkillBit fixes that. Bite-sized lessons built around your trip. 5 minutes a day, quick questions, instant feedback, and real progress you can see. Let's get you ready! 🌍</p>
            </div>
            <div className="bubbie-wrap">
              <img src="/bubbie.png" alt="Bubbie" className="bubbie-img" />
            </div>
            <button className="onboarding-btn" onClick={() => go('destination')}>Let's go! 🚀</button>
          </div>
        )}

        {/* ── Screen 4: Destination input ── */}
        {step === 'destination' && (
          <div className="screen-bubbie">
            <div className="speech-bubble">
              <p>Where are you going soon? 🗺️</p>
            </div>
            <div className="bubbie-wrap">
              <img src="/bubbie.png" alt="Bubbie" className="bubbie-img bubbie-img--small" />
            </div>
            <input
              className="onboarding-input"
              type="text"
              placeholder="e.g. Paris, France"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              autoFocus
            />
            <button
              className="onboarding-btn"
              disabled={!destination.trim()}
              onClick={() => go('calendar')}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Screen 5: Calendar ── */}
        {step === 'calendar' && (
          <div className="screen-calendar">
            <div className="speech-bubble">
              <p>When are you leaving? Pick your trip date! 📅</p>
            </div>
            <CalendarPicker onSelect={handleDateSelect} />
          </div>
        )}

        {/* ── Screen 6: Confirmation ── */}
        {step === 'confirm' && (
          <div className="screen-bubbie">
            <div className="speech-bubble">
              <p>Got it! You're going to <strong>{destLabel}</strong> in <strong>{days} days</strong>. I'll build your perfect lesson plan! ✈️</p>
            </div>
            <div className="bubbie-wrap">
              <img src="/bubbie.png" alt="Bubbie" className="bubbie-img" />
            </div>
            <button className="onboarding-btn" onClick={() => go('interests')}>Build my plan →</button>
          </div>
        )}

        {/* ── Screen 7: Interests ── */}
        {step === 'interests' && (
          <div className="screen-bubbie">
            <div className="speech-bubble">
              <p>What would you like to know? Tell me about your trip! 💬</p>
            </div>
            <div className="bubbie-wrap">
              <img src="/bubbie.png" alt="Bubbie" className="bubbie-img bubbie-img--small" />
            </div>
            <textarea
              className="onboarding-input onboarding-textarea"
              placeholder={`e.g. Going to ${destLabel} — I want to get around by metro and I love museums!`}
              value={interests}
              onChange={e => setInterests(e.target.value)}
              rows={3}
              autoFocus
            />
            <button
              className="onboarding-btn"
              disabled={!interests.trim()}
              onClick={handleFinish}
            >
              Start my lessons! 🎯
            </button>
          </div>
        )}

        {/* Progress dots */}
        {step !== 'calendar' && (
          <div className="progress-dots">
            {['logo','problem','solution','destination','confirm','interests'].map((s) => {
              const dotSteps = ['logo','problem','solution','destination','confirm','interests']
              const dotIdx = dotSteps.indexOf(s)
              return (
                <div key={s} className={`dot ${step === s ? 'dot--active' : dotIdx < dotSteps.indexOf(step) ? 'dot--done' : ''}`} />
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
