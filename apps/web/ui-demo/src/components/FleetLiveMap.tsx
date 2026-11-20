import React, { useEffect, useState } from 'react';
import { BatteryCharging, Fuel, Lock, Unlock, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface VehicleTelemetry {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  batteryLevel?: number;
  fuelLevel?: number;
  doorsLocked: boolean;
  engineRunning: boolean;
  dtcAlerts: string[];
  lastUpdated: string;
}

export const FleetLiveMap: React.FC<{ adminToken: string }> = ({ adminToken }) => {
  const [fleet, setFleet] = useState<VehicleTelemetry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLiveFleet = async () => {
    try {
      const data = await apiRequest<{ fleet: VehicleTelemetry[] }>('/admin/fleet/live-map', {}, adminToken);
      setFleet(data.fleet);
    } catch (err: any) {
      console.error('Failed to fetch fleet map:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFleet();
    const interval = setInterval(fetchLiveFleet, 3000); // 3-second live refresh
    return () => clearInterval(interval);
  }, []);

  const handleCommand = async (vehicleId: string, command: 'LOCK_DOORS' | 'UNLOCK_DOORS') => {
    try {
      await apiRequest(
        `/admin/fleet/${vehicleId}/command`,
        {
          method: 'POST',
          body: JSON.stringify({ command }),
        },
        adminToken
      );
      fetchLiveFleet();
    } catch (err: any) {
      alert(`Command failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Fleet Telematics Command Center</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time GPS tracking, battery/fuel monitoring, and OBD-II diagnostics (FR-11.1)</p>
        </div>
        <button
          onClick={fetchLiveFleet}
          className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fleet.map((car) => (
          <div key={car.vehicleId} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">ID: {car.vehicleId.slice(0, 8)}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${car.engineRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-sm font-bold text-slate-800">{car.engineRunning ? 'Engine Active' : 'Parked'}</span>
                </div>
              </div>
              <span className="text-xs bg-slate-100 font-mono px-2 py-1 rounded text-slate-600">
                {car.speedKmh} km/h
              </span>
            </div>

            {/* Critical DTC Diagnostics (FR-11.1) */}
            {car.dtcAlerts && car.dtcAlerts.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0 animate-bounce" />
                OBD-II Fault: {car.dtcAlerts.join(', ')}
              </div>
            )}

            {/* Gauges */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="flex items-center p-2.5 bg-slate-50 rounded-lg">
                <BatteryCharging className="w-4 h-4 mr-2 text-emerald-600" />
                <span>Battery: {car.batteryLevel ?? 'N/A'}%</span>
              </div>
              <div className="flex items-center p-2.5 bg-slate-50 rounded-lg">
                <Fuel className="w-4 h-4 mr-2 text-blue-600" />
                <span>Fuel: {car.fuelLevel ?? 'N/A'}%</span>
              </div>
            </div>

            {/* Location */}
            <div className="text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded-lg">
              GPS: {car.latitude.toFixed(4)}, {car.longitude.toFixed(4)}
            </div>

            {/* Remote Command Control (FR-8.1) */}
            <div className="pt-2 border-t flex gap-2">
              <button
                onClick={() => handleCommand(car.vehicleId, car.doorsLocked ? 'UNLOCK_DOORS' : 'LOCK_DOORS')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center transition ${
                  car.doorsLocked
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                }`}
              >
                {car.doorsLocked ? <Unlock className="w-3.5 h-3.5 mr-1" /> : <Lock className="w-3.5 h-3.5 mr-1" />}
                {car.doorsLocked ? 'Remote Unlock' : 'Remote Lock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};