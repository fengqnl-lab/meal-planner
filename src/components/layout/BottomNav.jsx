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
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex md:hidden z-10">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 text-xs gap-0.5 transition-colors
             ${isActive ? 'text-primary-600 font-medium' : 'text-gray-400'}`
          }
        >
          <Icon size={22} strokeWidth={1.5} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
