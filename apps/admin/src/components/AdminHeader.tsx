import React, { useState } from 'react';
import { Bell, User, ChevronRight } from 'lucide-react';

interface HeaderProps {
  breadcrumbs: string[];
}

export const AdminHeader: React.FC<HeaderProps> = ({ breadcrumbs }) => {
  const [hoveredBtn, setHoveredBtn] = useState<'notifications' | 'user' | null>(null);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 ml-16">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center text-sm font-semibold">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />}
            <span className={idx === breadcrumbs.length - 1 ? 'text-slate-900 font-bold text-lg' : 'text-slate-400'}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell with Badge '3' */}
        <div 
          className="relative"
          onMouseEnter={() => setHoveredBtn('notifications')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cdw-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          {hoveredBtn === 'notifications' && (
            <div className="absolute right-0 top-12 z-50 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-md whitespace-nowrap">
              Notifications
            </div>
          )}
        </div>

        {/* User Profile */}
        <div 
          className="relative"
          onMouseEnter={() => setHoveredBtn('user')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition">
            <User className="w-5 h-5" />
          </button>
          {hoveredBtn === 'user' && (
            <div className="absolute right-0 top-12 z-50 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-md whitespace-nowrap">
              User Menu
            </div>
          )}
        </div>
      </div>
    </header>
  );
};