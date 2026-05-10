import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarDays, Lightbulb, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/recipes',     label: '菜谱', icon: BookOpen },
  { to: '/menu',        label: '菜单', icon: CalendarDays },
  { to: '/inspiration', label: '灵感', icon: Lightbulb },
  { to: '/settings',    label: '设置', icon: Settings },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/70 backdrop-blur-xl border-t border-stone-100/60 flex md:hidden z-10 px-2 pb-safe">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2.5 text-xs gap-1 transition-all duration-200 rounded-xl mx-0.5
             ${isActive ? 'text-primary-700 font-medium bg-primary-50/60' : 'text-gray-400 hover:text-gray-600'}`
          }
        >
          <Icon size={20} strokeWidth={1.5} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
