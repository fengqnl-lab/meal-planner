import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/recipes',     label: '菜谱', icon: '📖' },
  { to: '/menu',        label: '菜单', icon: '📅' },
  { to: '/inspiration', label: '灵感', icon: '💡' },
  { to: '/settings',    label: '设置', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex md:hidden z-10">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 text-xs gap-0.5 transition-colors
             ${isActive ? 'text-primary-600 font-medium' : 'text-gray-400'}`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
