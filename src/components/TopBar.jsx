import './TopBar.css'

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="section-banner">
        <div className="section-banner-left">
          <span className="section-back">← SECTION 1, UNIT 1</span>
          <span className="section-title">Place order at cafe</span>
        </div>
        <button className="guidebook-btn">📋 GUIDEBOOK</button>
      </div>
      <div className="stats-bar">
        <span className="stat">🇮🇪</span>
        <span className="stat streak">🔥 <span className="stat-value">0</span></span>
        <span className="stat gems">💎 <span className="stat-value">500</span></span>
        <span className="stat hearts">❤️ <span className="stat-value">5</span></span>
      </div>
    </div>
  )
}
