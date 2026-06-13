import './RightPanel.css'

export default function RightPanel({ progress, dailyXPGoal }) {
  const lessonsCompleted = progress?.lessonsCompleted ?? 0
  const dailyXP          = progress?.dailyXP ?? 0
  const goal             = dailyXPGoal ?? 10
  const questPct         = Math.min((dailyXP / goal) * 100, 100)
  const questDone        = dailyXP >= goal

  const lessonsToUnlock = Math.max(0, 3 - lessonsCompleted)

  return (
    <aside className="right-panel">

      {/* Leaderboard unlock card */}
      <div className="rp-card">
        <div className="rp-card-header">
          <div className={`rp-icon ${lessonsToUnlock > 0 ? 'rp-icon--shield' : ''}`}>
            {lessonsToUnlock > 0 ? '🛡️' : '🏆'}
          </div>
          <div>
            {lessonsToUnlock > 0 ? (
              <>
                <div className="rp-card-title">Unlock Leaderboards!</div>
                <div className="rp-card-sub">
                  Complete {lessonsToUnlock} more {lessonsToUnlock === 1 ? 'lesson' : 'lessons'} to start competing
                </div>
              </>
            ) : (
              <>
                <div className="rp-card-title">Leaderboards Unlocked!</div>
                <div className="rp-card-sub">
                  You've completed {lessonsCompleted} lessons — keep going!
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Daily quest */}
      <div className="rp-card">
        <div className="rp-card-row-header">
          <div className="rp-card-title">Daily Quests</div>
          <a className="rp-view-all" href="#">VIEW ALL</a>
        </div>
        <div className="rp-quest-item">
          <div className="rp-icon rp-icon--bolt">⚡</div>
          <div className="rp-quest-info">
            <div className="rp-quest-name">
              {questDone ? '✓ Daily goal complete!' : `Earn ${goal} XP`}
            </div>
            <div className="rp-progress-wrap">
              <div className="rp-progress-bar">
                <div
                  className={`rp-progress-fill ${questDone ? 'rp-progress-fill--done' : ''}`}
                  style={{ width: `${questPct}%` }}
                />
              </div>
              <span className="rp-progress-label">{dailyXP} / {goal}</span>
              <span className="rp-chest-icon">{questDone ? '🎉' : '📦'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="rp-card">
        <div className="rp-card-title" style={{ marginBottom: 16 }}>
          {lessonsCompleted > 0
            ? `${lessonsCompleted} ${lessonsCompleted === 1 ? 'lesson' : 'lessons'} completed — keep it up!`
            : 'Create a profile to save your progress!'}
        </div>
        <button className="rp-btn rp-btn--green">CREATE A PROFILE</button>
        <button className="rp-btn rp-btn--blue">SIGN IN</button>
      </div>

      <div className="rp-footer">
        <div className="rp-footer-row">
          <a href="#">ABOUT</a>
          <a href="#">BLOG</a>
          <a href="#">STORE</a>
          <a href="#">EFFICACY</a>
          <a href="#">CAREERS</a>
        </div>
        <div className="rp-footer-row">
          <a href="#">INVESTORS</a>
          <a href="#">TERMS</a>
          <a href="#">PRIVACY</a>
        </div>
      </div>
    </aside>
  )
}
