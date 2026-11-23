import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  KeyRound, 
  MapPin, 
  BarChart3, 
  Settings 
} from 'lucide-react';

export type NavTab = 'dashboard' | 'fleet' | 'booking' | 'tracking' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet', icon: Building2 },
    { id: 'booking', label: 'Booking', icon: KeyRound },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 justify-between h-screen fixed left-0 top-0 z-40 select-none">
      <div className="flex flex-col items-center w-full space-y-6">
        {/* Brand Icon: Red CDW Rounded Rectangle */}
        <div className="w-10 h-10 bg-cdw-red rounded-xl flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-sm cursor-pointer">
          CDW
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center space-y-3 w-full">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <div 
                key={item.id} 
                className="relative flex items-center justify-center w-full"
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </button>

                {/* Dark Hover Tooltip matching pages 5–12 */}
                {isHovered && (
                  <div className="absolute left-14 z-50 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-150">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings Icon */}
      <div 
        className="relative flex items-center justify-center w-full"
        onMouseEnter={() => setHoveredTab('settings')}
        onMouseLeave={() => setHoveredTab(null)}
      >
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-slate-100 text-slate-900 border border-slate-300'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>

        {hoveredTab === 'settings' && (
          <div className="absolute left-14 z-50 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-150">
            Settings
          </div>
        )}
      </div>
    </aside>
  );
};