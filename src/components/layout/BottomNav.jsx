import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarDays, Plus } from 'lucide-react'

export default function BottomNav() {
  return (
    <div className="fixed bottom-5 inset-x-0 flex justify-center md:hidden z-10 px-6">
      <nav className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-full shadow-elevated px-3 py-2">
        <NavLink
          to="/recipes"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-5 py-1.5 text-xs gap-0.5 transition-all duration-200 rounded-full
             ${isActive ? 'text-primary-700 font-medium' : 'text-gray-400 hover:text-gray-600'}`
          }
        >
          <BookOpen size={20} strokeWidth={1.5} />
          菜谱
        </NavLink>

        <NavLink
          to="/add"
          className="flex items-center justify-center"
        >
          <div className="w-11 h-11 rounded-full bg-primary-600 shadow-lg shadow-primary-600/30 flex items-center justify-center text-white hover:bg-primary-700 active:scale-95 transition-all duration-200">
            <Plus size={22} strokeWidth={2.5} />
          </div>
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-5 py-1.5 text-xs gap-0.5 transition-all duration-200 rounded-full
             ${isActive ? 'text-primary-700 font-medium' : 'text-gray-400 hover:text-gray-600'}`
          }
        >
          <CalendarDays size={20} strokeWidth={1.5} />
          菜单
        </NavLink>
      </nav>
    </div>
  )
}
