import { useState } from 'react'

const KEY = 'skillset_progress'
const DAILY_XP_GOAL = 10

function today() {
  return new Date().toDateString()
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch {}
}

const DEFAULTS = {
  totalXP: 0,
  lessonsCompleted: 0,
  dailyXP: 0,
  lastPlayDate: null,
  streak: 0,
  hearts: 5,
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    const saved = load()
    if (!saved) return DEFAULTS
    // Reset dailyXP at the start of a new day
    if (saved.lastPlayDate !== today()) {
      return { ...saved, dailyXP: 0 }
    }
    return saved
  })

  function addLessonXP(xp) {
    setProgress(prev => {
      const isNewDay = prev.lastPlayDate !== today()
      const updated = {
        ...prev,
        totalXP: prev.totalXP + xp,
        dailyXP: (isNewDay ? 0 : prev.dailyXP) + xp,
        lessonsCompleted: prev.lessonsCompleted + 1,
        lastPlayDate: today(),
        streak: isNewDay ? prev.streak + 1 : prev.streak,
      }
      save(updated)
      return updated
    })
  }

  function resetProgress() {
    save(DEFAULTS)
    setProgress(DEFAULTS)
  }

  return { progress, addLessonXP, resetProgress, DAILY_XP_GOAL }
}
