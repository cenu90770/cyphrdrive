import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { AdminSidebar, NavTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { FleetTable } from './components/FleetTable';
import { FleetGrid } from './components/FleetGrid';
import { VehicleDetailsView } from './components/VehicleDetailsView';
import { VehicleOnboardingWizard } from './components/VehicleOnboardingWizard';
import { AdminBookingWizard } from './components/AdminBookingWizard';
import { BookingManagement } from './components/BookingManagement';
import { FleetVehicle } from './data/fleetData';
import { apiRequest } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('fleet');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [bookingVehicle, setBookingVehicle] = useState<FleetVehicle | null>(null);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [showFilterBar, setShowFilterBar] = useState<boolean>(true);

  // Live Data States
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('20.07.2026');
  const [dateTo, setDateTo] = useState('28.07.2026');

  // Authenticate Fleet Admin on mount
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

  // Fetch live fleet data
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

      const mappedVehicles: FleetVehicle[] = data.vehicles.map((v, index) => ({
        id: v.id,
        displayId: v.id.replace(/-/g, '').slice(-6).toUpperCase(),
        ref: v.specs?.vehicleRef || `SB${String(index + 2).padStart(3, '0')}`,
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
        specs: v.specs,
        leasing: v.specs?.leasing,
        insurance: v.specs?.insurance,
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

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter === 'all') return true;
    return v.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getBreadcrumbs = () => {
    if (bookingVehicle) return ['Booking', 'New Booking'];
    if (activeTab === 'booking') return ['Booking', 'Overview'];
    if (activeTab === 'dashboard') return ['Dashboard'];
    if (activeTab === 'fleet') {
      if (isOnboarding) return ['Fleet', 'New Item'];
      if (selectedVehicle) return ['Fleet', 'Vehicle Details'];
      return ['Fleet', 'Overview'];
    }
    return [activeTab.charAt(0).toUpperCase() + activeTab.slice(1)];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar 
        activeTab={activeTab} 
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedVehicle(null);
          setIsOnboarding(false);
          setBookingVehicle(null);
        }} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader breadcrumbs={getBreadcrumbs()} />

        <main className="p-8 ml-16 flex-1">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded">
              {errorMessage}
            </div>
          )}

          {/* VIEW 1: FLEET OVERVIEW */}
          {activeTab === 'fleet' && !selectedVehicle && !isOnboarding && !bookingVehicle && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsOnboarding(true)}
                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl flex items-center transition shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Item
                  </button>

                  {showFilterBar && (
                    <div className="flex items-center space-x-2">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700"
                      >
                        <option value="all">all</option>
                        <option value="available">available</option>
                        <option value="booked">booked</option>
                        <option value="picked-up">picked-up</option>
                        <option value="service">service</option>
                        <option value="issue">issue</option>
                      </select>

                      <input type="text" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 w-28 text-center" />
                      <input type="text" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 w-28 text-center" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button onClick={fetchFleetVehicles} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={() => setShowFilterBar(!showFilterBar)} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600">
                    <Filter className="w-4 h-4" />
                  </button>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button onClick={() => setViewMode('table')} className={`p-2 transition ${viewMode === 'table' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                      <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('grid')} className={`p-2 transition ${viewMode === 'grid' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-2xl font-black text-slate-900">
                    {filteredVehicles.length} <span className="text-sm font-normal text-slate-400">/50</span>
                  </span>
                </div>
              </div>

              {viewMode === 'table' ? (
                <FleetTable vehicles={filteredVehicles} onSelectVehicle={setSelectedVehicle} />
              ) : (
                <FleetGrid 
                  vehicles={filteredVehicles} 
                  onSelectVehicle={setSelectedVehicle}
                  onBookVehicle={(v) => setBookingVehicle(v)}
                />
              )}
            </div>
          )}

          {/* VIEW 2: BOOKINGS LIST & RETURN MANAGEMENT (Tab: KeyRound) */}
          {activeTab === 'booking' && !bookingVehicle && adminToken && (
            <BookingManagement
              adminToken={adminToken}
              onNewBookingClick={() => {
                const car = vehicles.find((v) => v.status === 'available') || vehicles[0];
                setBookingVehicle(car);
              }}
            />
          )}

          {/* VIEW 3: 4-STEP BOOKING WIZARD */}
          {bookingVehicle && adminToken && (
            <AdminBookingWizard
              vehicle={bookingVehicle}
              adminToken={adminToken}
              onCancel={() => setBookingVehicle(null)}
              onBookingCompleted={() => {
                setBookingVehicle(null);
                setActiveTab('booking');
                fetchFleetVehicles();
              }}
            />
          )}

          {/* VIEW 4: ONBOARDING WIZARD */}
          {activeTab === 'fleet' && isOnboarding && adminToken && (
            <VehicleOnboardingWizard
              adminToken={adminToken}
              onCancel={() => setIsOnboarding(false)}
              onSuccess={() => {
                setIsOnboarding(false);
                fetchFleetVehicles();
              }}
            />
          )}

          {/* VIEW 5: VEHICLE DETAILS */}
          {activeTab === 'fleet' && selectedVehicle && !isOnboarding && !bookingVehicle && (
            <VehicleDetailsView 
              vehicle={selectedVehicle} 
              onBack={() => setSelectedVehicle(null)} 
            />
          )}

          {/* PLACEHOLDER VIEWS */}
          {['dashboard', 'tracking', 'analytics', 'settings'].includes(activeTab) && (
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