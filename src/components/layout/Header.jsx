import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { useNavigate, NavLink } from 'react-router-dom'
import { BookOpen, CalendarDays, Lightbulb, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/recipes',     label: '菜谱', icon: BookOpen },
  { to: '/menu',        label: '菜单', icon: CalendarDays },
  { to: '/inspiration', label: '灵感', icon: Lightbulb },
  { to: '/settings',    label: '设置', icon: Settings },
]

export default function Header() {
  const { session, signOut } = useAuth()
  const { displayName, avatarUrl } = useProfile(session)
  const navigate = useNavigate()
  const currentName = displayName || session?.user?.email?.split('@')[0]

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
      <button onClick={() => navigate('/recipes')} className="font-semibold text-gray-800 hover:text-primary-600 transition-colors shrink-0">
        🍳 一起吃饭
      </button>

      {/* 桌面端导航 */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5
               ${isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`
            }
          >
            <Icon size={16} strokeWidth={1.5} />{label}
          </NavLink>
        ))}
      </nav>

      {/* 头像 + 用户名（点击跳设置） */}
      <button onClick={() => navigate('/settings')} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-primary-500">{currentName?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <span className="hidden md:block text-sm text-gray-700 max-w-24 truncate">{currentName}</span>
      </button>
    </header>
  )
}
