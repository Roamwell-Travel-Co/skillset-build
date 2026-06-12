import './Sidebar.css'

const navItems = [
  { id: 'learn',        label: 'LEARN',        emoji: '🏠' },
  { id: 'leaderboards', label: 'LEADERBOARDS',  emoji: '🛡️' },
  { id: 'skillbit',     label: 'SKILLBIT',      emoji: '✈️', isNew: true },
  { id: 'quests',       label: 'QUESTS',        emoji: '📦' },
  { id: 'shop',         label: 'SHOP',          emoji: '🎁' },
  { id: 'profile',      label: 'PROFILE',       emoji: '👤' },
  { id: 'more',         label: 'MORE',          emoji: '⋯' },
]

export default function Sidebar({ activePage, onNav }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">duolingo</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'nav-item--active' : ''} ${item.isNew ? 'nav-item--new' : ''}`}
            onClick={() => onNav(item.id)}
          >
            <span className="nav-icon">{item.emoji}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  )
}
