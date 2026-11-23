import React, { useState } from 'react';
import { Plus, Filter, LayoutGrid, List } from 'lucide-react';
import { AdminSidebar, NavTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { FleetTable } from './components/FleetTable';
import { FleetGrid } from './components/FleetGrid';
import { VehicleDetailsView } from './components/VehicleDetailsView';
import { INITIAL_FLEET, FleetVehicle } from './data/fleetData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('fleet');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [showFilterBar, setShowFilterBar] = useState<boolean>(true);

  // Filters state (page 16)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('20.07.2026');
  const [dateTo, setDateTo] = useState('31.12.2026');

  // Breadcrumb generator
  const getBreadcrumbs = () => {
    if (activeTab === 'dashboard') return ['Dashboard'];
    if (activeTab === 'fleet') {
      if (selectedVehicle) return ['Fleet', 'Vehicle Details'];
      return ['Fleet', 'Overview'];
    }
    return [activeTab.charAt(0).toUpperCase() + activeTab.slice(1)];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Left Icon Sidebar */}
      <AdminSidebar activeTab={activeTab} onSelectTab={(tab) => {
        setActiveTab(tab);
        setSelectedVehicle(null);
      }} />

      {/* 2. Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader breadcrumbs={getBreadcrumbs()} />

        <main className="p-8 ml-16 flex-1">
          {activeTab === 'fleet' && !selectedVehicle && (
            <div className="space-y-6">
              {/* Fleet Toolbar (matches pages 15 & 16) */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl flex items-center transition shadow-sm">
                    <Plus className="w-4 h-4 mr-1.5" /> Add Item
                  </button>

                  {/* Filter Toolbar (page 16) */}
                  {showFilterBar && (
                    <div className="flex items-center space-x-2">
                      <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700"
                      >
                        <option value="all">all</option>
                        <option value="compact">Compact</option>
                        <option value="suv">SUV</option>
                      </select>

                      <input 
                        type="text" 
                        value={dateFrom} 
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 w-28 text-center" 
                      />
                      <input 
                        type="text" 
                        value={dateTo} 
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 w-28 text-center" 
                      />
                    </div>
                  )}
                </div>

                {/* Right controls: Filter toggle, View Mode toggle, Counter 14/50 */}
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowFilterBar(!showFilterBar)}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
                  >
                    <Filter className="w-4 h-4" />
                  </button>

                  {/* Grid / Table Toggle */}
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 transition ${viewMode === 'table' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition ${viewMode === 'grid' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fleet Counter */}
                  <span className="text-2xl font-black text-slate-900">
                    14 <span className="text-sm font-normal text-slate-400">/50</span>
                  </span>
                </div>
              </div>

              {/* View Switcher */}
              {viewMode === 'table' ? (
                <FleetTable vehicles={INITIAL_FLEET} onSelectVehicle={setSelectedVehicle} />
              ) : (
                <FleetGrid vehicles={INITIAL_FLEET} onSelectVehicle={setSelectedVehicle} />
              )}
            </div>
          )}

          {/* Vehicle Details Subview */}
          {activeTab === 'fleet' && selectedVehicle && (
            <VehicleDetailsView 
              vehicle={selectedVehicle} 
              onBack={() => setSelectedVehicle(null)} 
            />
          )}

          {/* Placeholders for remaining tabs (Pages 4–12) */}
          {activeTab !== 'fleet' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center text-slate-300 font-bold text-lg">
                  {activeTab.toUpperCase()} WIDGET {i}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}