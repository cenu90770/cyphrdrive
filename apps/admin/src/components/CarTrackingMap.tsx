import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
// @ts-ignore Leaflet CSS is loaded by the bundler and has no module declarations.
import 'leaflet/dist/leaflet.css';
import { 
  RefreshCw, 
  BatteryCharging, 
  Fuel, 
  Lock, 
  Unlock, 
  MapPin 
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export const CarTrackingMap: React.FC<{ adminToken: string }> = ({ adminToken }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Active Vehicle State
  const [activeCar, setActiveCar] = useState({
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    brand: 'MG',
    model: 'ZS',
    ref: 'MZ008',
    speed: '16 km',
    address: 'Borj Louzir',
    subAddress: 'V672+P56 Ariana',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    battery: 92,
    fuel: 85,
    doorsLocked: true,
  });

  // Trajectory Waypoints (Mock data)
  const trajectoryRoute: [number, number][] = [
    [36.8655, 10.1980], // Borj Louzir / Ariana (Car Position)
    [36.8685, 10.2150], // Chotrana
    [36.8640, 10.2350], // La Soukra
    [36.8520, 10.2460], // El Aouina
    [36.8420, 10.2580], // Ain Zaghouan
    [36.8375, 10.2450], // Les Berges du Lac II (Red Destination Pin)
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 1. Initialize Map centered on the location of the branch the fleet is assigned to.
    const map = L.map(mapContainerRef.current, {
      center: [36.8520, 10.2280],
      zoom: 12,
      zoomControl: false, // We add it to bottom-right
    });

    // 2. Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // 3. Add Dotted Green Trajectory Line
    L.polyline(trajectoryRoute, {
      color: '#10B981', // Emerald green
      weight: 4,
      dashArray: '6, 12',
      lineCap: 'round',
    }).addTo(map);

    // 4. Add Green Waypoint Dots
    const dotIcon = L.divIcon({
      className: 'custom-dot-marker',
      html: `<div style="width: 12px; height: 12px; border-radius: 50%; background-color: #14b8a6; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    trajectoryRoute.forEach((coords) => {
      L.marker(coords, { icon: dotIcon }).addTo(map);
    });

    // 5. Custom Car Marker
    const carIcon = L.divIcon({
      className: 'custom-car-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="width: 36px; height: 36px; border-radius: 12px; background-color: #0f172a; border: 2px solid #ffffff; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: -5px; width: 8px; height: 8px; background-color: #0f172a; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    // 6. Custom Popup HTML
    const popupHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; width: 220px; padding: 4px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80" style="width: 65px; height: 42px; object-fit: contain;" />
          <div>
            <div style="font-size: 13px; font-weight: 900; color: #0f172a; line-height: 1.1;">MG ZS</div>
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">MZ008</div>
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-top: 2px;">
              ⏱ 16 km
            </div>
          </div>
        </div>
        <div style="padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; align-items: flex-start; gap: 6px;">
          <span style="color: #ef4444; font-size: 14px; line-height: 1;">📍</span>
          <div>
            <div style="font-size: 12px; font-weight: 900; color: #0f172a; line-height: 1.2;">Borj Louzir</div>
            <div style="font-size: 10px; font-weight: 600; color: #94a3b8; font-family: monospace;">V672+P56 Ariana</div>
          </div>
        </div>
      </div>
    `;

    const carMarker = L.marker([36.8655, 10.1980], { icon: carIcon }).addTo(map);
    carMarker.bindPopup(popupHtml, { autoPan: false, closeButton: false }).openPopup();

    // 7. Red Destination Pin at branch location
    const redPinIcon = L.divIcon({
      className: 'custom-red-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #dc2626; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([36.8375, 10.2450], { icon: redPinIcon }).addTo(map);

    // 8. Place Zoom Controls at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup on unmount (prevents React 18 duplicate initialization)
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Remote Door Lock/Unlock Command (FR-8.1)
  const toggleDoorLock = async () => {
    const newLockState = !activeCar.doorsLocked;
    const command = newLockState ? 'LOCK_DOORS' : 'UNLOCK_DOORS';

    try {
      await apiRequest(
        `/admin/fleet/${activeCar.id}/command`,
        { method: 'POST', body: JSON.stringify({ command }) },
        adminToken
      );

      setActiveCar((prev) => ({ ...prev, doorsLocked: newLockState }));
    } catch (err: any) {
      alert(`Command failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-black text-slate-900">Car Tracking</h1>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-full flex items-center">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse mr-2"></span>
            Live GPS Stream Active
          </span>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 600);
          }}
          className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition"
          title="Refresh GPS positions"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Map Canvas Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm h-[720px] relative overflow-hidden">
        {/* Native Leaflet Map Container */}
        <div ref={mapContainerRef} className="h-full w-full rounded-2xl" />

        {/* Floating Telematics Dashboard Drawer (Bottom Overlay) */}
        <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
          <div className="max-w-2xl bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-2xl pointer-events-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={activeCar.image}
                alt={activeCar.model}
                className="w-16 h-10 object-contain"
              />
              <div>
                <p className="text-xs font-black text-slate-900">
                  {activeCar.brand} {activeCar.model} ({activeCar.ref})
                </p>
                <p className="text-[11px] text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {activeCar.address}
                </p>
              </div>
            </div>

            {/* Live Metrics & Remote Lock */}
            <div className="flex items-center space-x-4 text-xs font-bold text-slate-700">
              <div className="flex items-center">
                <BatteryCharging className="w-4 h-4 text-emerald-600 mr-1" />
                <span>{activeCar.battery}%</span>
              </div>
              <div className="flex items-center">
                <Fuel className="w-4 h-4 text-blue-600 mr-1" />
                <span>{activeCar.fuel}%</span>
              </div>
              <button
                onClick={toggleDoorLock}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center transition shadow-sm ${
                  activeCar.doorsLocked
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {activeCar.doorsLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1 text-slate-500" /> Locked
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 mr-1 text-white" /> Unlocked
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};