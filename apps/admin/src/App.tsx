import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { AdminSidebar, NavTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { FleetTable } from './components/FleetTable';
import { FleetGrid } from './components/FleetGrid';
import { VehicleDetailsView } from './components/VehicleDetailsView';
import { FleetVehicle } from './data/fleetData';
import { apiRequest } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('fleet');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [showFilterBar, setShowFilterBar] = useState<boolean>(true);

  // Live Data States
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters state (page 16)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('20.07.2026');
  const [dateTo, setDateTo] = useState('31.12.2026');

  // 1. Authenticate Fleet Admin on mount
  useEffect(() => {
    async function loginFleetAdmin() {
      try {
        const auth = await apiRequest<{ accessToken: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'fleet.admin@cyphrdrive.io',
            password: 'Password123!',
          }),
        });
        setAdminToken(auth.accessToken);
      } catch (err: any) {
        setErrorMessage(`Authentication Error: ${err.message}`);
        setLoading(false);
      }
    }

    loginFleetAdmin();
  }, []);

  // 2. Fetch live fleet data from PostgreSQL via Backend API
  const fetchFleetVehicles = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiRequest<{ count: number; vehicles: any[] }>(
        '/admin/fleet/vehicles',
        {},
        adminToken
      );

      // Map backend database rows to UI FleetVehicle type
      const mappedVehicles: FleetVehicle[] = data.vehicles.map((v, index) => ({
        id: v.id.slice(0, 8), // Clean readable short ID
        ref: `CD-${String(index + 1).padStart(3, '0')}`,
        brand: v.brand,
        model: v.model,
        transmission: v.transmission,
        fuel: v.fuel,
        power: v.power,
        firstReg: v.firstReg,
        mileage: v.mileage,
        nextMaint: v.nextMaint,
        status: v.status,
        ratePerDay: v.ratePerDay,
        image: v.image || undefined,
        licensePlate: v.license_plate,
        specs: {
          seats: v.specs?.seats || 5,
          largeBags: v.specs?.largeBags || 1,
          smallBags: v.specs?.smallBags || 1,
        },
        leasing: {
          provider: 'Tunisie Leasing SA',
          contractRef: `LS-${v.vin.slice(0, 6)}`,
          start: '04.03.2026',
          end: '04.03.2029',
          type: 'Full amortisation',
          downPayment: '17.360,00 TND (20%)',
          monthlyCharge: '1.928,88 TND',
          amount: '86.800,00 TND',
        },
        insurance: {
          provider: 'Tunisie Assurance SA',
          contractRef: `TAL-${v.vin.slice(0, 6)}`,
          start: '04.03.2026',
          end: '-',
          type: 'Liability coverage',
          damageCoverage: '10.000.000 TND',
          monthlyCharge: '928,00 TND',
        },
      }));

      setVehicles(mappedVehicles);
    } catch (err: any) {
      setErrorMessage(`Failed to load fleet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      fetchFleetVehicles();
    }
  }, [adminToken, fetchFleetVehicles]);

  // Filter vehicles by category
  const filteredVehicles = vehicles.filter((v) => {
    if (categoryFilter === 'all') return true;
    return v.brand.toLowerCase().includes(categoryFilter) || v.model.toLowerCase().includes(categoryFilter);
  });

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
      <AdminSidebar activeTab={activeTab} onSelectTab={(tab) => {
        setActiveTab(tab);
        setSelectedVehicle(null);
      }} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader breadcrumbs={getBreadcrumbs()} />

        <main className="p-8 ml-16 flex-1">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded">
              {errorMessage}
            </div>
          )}

          {activeTab === 'fleet' && !selectedVehicle && (
            <div className="space-y-6">
              {/* Fleet Toolbar (pages 15 & 16) */}
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
                        <option value="bmw">BMW</option>
                        <option value="audi">Audi</option>
                        <option value="volkswagen">Volkswagen</option>
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

                {/* Right controls: Refresh, Filter toggle, View Mode toggle, Counter */}
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={fetchFleetVehicles}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

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

                  {/* Live Fleet Counter */}
                  <span className="text-2xl font-black text-slate-900">
                    {filteredVehicles.length} <span className="text-sm font-normal text-slate-400">/50</span>
                  </span>
                </div>
              </div>

              {/* View Rendering */}
              {loading && vehicles.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm font-medium">
                  Loading fleet data from database...
                </div>
              ) : viewMode === 'table' ? (
                <FleetTable vehicles={filteredVehicles} onSelectVehicle={setSelectedVehicle} />
              ) : (
                <FleetGrid vehicles={filteredVehicles} onSelectVehicle={setSelectedVehicle} />
              )}
            </div>
          )}

          {activeTab === 'fleet' && selectedVehicle && (
            <VehicleDetailsView 
              vehicle={selectedVehicle} 
              onBack={() => setSelectedVehicle(null)} 
            />
          )}

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