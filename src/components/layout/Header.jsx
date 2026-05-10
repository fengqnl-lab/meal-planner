import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { useNavigate, NavLink } from 'react-router-dom'
import { BookOpen, CalendarDays } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/recipes', label: '菜谱', icon: BookOpen },
  { to: '/menu',    label: '菜单', icon: CalendarDays },
]

export default function Header() {
  const { session } = useAuth()
  const { displayName, avatarUrl } = useProfile(session)
  const navigate = useNavigate()
  const currentName = displayName || session?.user?.email?.split('@')[0]

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-stone-100/60 px-5 h-14 flex items-center justify-between">
      <button onClick={() => navigate('/recipes', { state: { cancelForm: true } })} className="font-semibold text-gray-800 hover:text-primary-700 transition-colors shrink-0 tracking-tight">
        一起吃饭
      </button>

      {/* 桌面端导航 */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-1.5
               ${isActive ? 'bg-primary-50 text-primary-700 font-medium shadow-sm' : 'text-gray-500 hover:bg-stone-100 hover:text-gray-700'}`
            }
          >
            <Icon size={15} strokeWidth={1.5} />{label}
          </NavLink>
        ))}
      </nav>

      {/* 头像 */}
      <button onClick={() => navigate('/settings')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center shrink-0 shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-primary-700">{currentName?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <span className="hidden md:block text-sm text-gray-600 max-w-24 truncate">{currentName}</span>
      </button>
    </header>
  )
}
