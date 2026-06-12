import './RightPanel.css'

export default function RightPanel() {
  return (
    <aside className="right-panel">
      <div className="rp-card">
        <div className="rp-card-header">
          <div className="rp-icon rp-icon--shield">🛡️</div>
          <div>
            <div className="rp-card-title">Unlock Leaderboards!</div>
            <div className="rp-card-sub">Complete 3 more lessons to start competing</div>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-card-row-header">
          <div className="rp-card-title">Daily Quests</div>
          <a className="rp-view-all" href="#">VIEW ALL</a>
        </div>
        <div className="rp-quest-item">
          <div className="rp-icon rp-icon--bolt">⚡</div>
          <div className="rp-quest-info">
            <div className="rp-quest-name">Earn 10 XP</div>
            <div className="rp-progress-wrap">
              <div className="rp-progress-bar">
                <div className="rp-progress-fill" style={{ width: '0%' }}></div>
              </div>
              <span className="rp-progress-label">0 / 10</span>
              <span className="rp-chest-icon">📦</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-card-title" style={{ marginBottom: 16 }}>
          Create a profile to save your progress!
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
