import { NavLink } from 'react-router-dom'
import { BookOpen, CalendarDays, Plus } from 'lucide-react'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/70 backdrop-blur-xl border-t border-stone-100/60 flex md:hidden z-10 px-6 pb-safe items-center justify-around">
      <NavLink
        to="/recipes"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-2.5 text-xs gap-1 transition-all duration-200
           ${isActive ? 'text-primary-700 font-medium' : 'text-gray-400 hover:text-gray-600'}`
        }
      >
        <BookOpen size={20} strokeWidth={1.5} />
        菜谱
      </NavLink>

      <NavLink
        to="/add"
        className="flex items-center justify-center -mt-4"
      >
        <div className="w-12 h-12 rounded-full bg-primary-600 shadow-lg shadow-primary-600/25 flex items-center justify-center text-white hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 active:scale-95 transition-all duration-200">
          <Plus size={24} strokeWidth={2} />
        </div>
      </NavLink>

      <NavLink
        to="/menu"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-2.5 text-xs gap-1 transition-all duration-200
           ${isActive ? 'text-primary-700 font-medium' : 'text-gray-400 hover:text-gray-600'}`
        }
      >
        <CalendarDays size={20} strokeWidth={1.5} />
        菜单
      </NavLink>
    </nav>
  )
}
