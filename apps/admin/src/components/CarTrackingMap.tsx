import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
// @ts-ignore Leaflet's stylesheet is loaded by the bundler, not TypeScript.
import 'leaflet/dist/leaflet.css';
import { 
  RefreshCw, 
  BatteryCharging, 
  Fuel, 
  Lock, 
  Unlock, 
  MapPin, 
  Gauge 
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export const CarTrackingMap: React.FC<{ adminToken: string }> = ({ adminToken }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const waypointLayerRef = useRef<L.LayerGroup | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Chronological Route: START at Les Berges du Lac II -> END at Borj Louzir (Current Location)
  const CHRONOLOGICAL_TUNIS_TRAJECTORY: [number, number][] = [
    [36.8375, 10.2450], // Point 0 (START): Les Berges du Lac II (Departure / Origin)
    [36.8420, 10.2580], // Point 1: Ain Zaghouan
    [36.8470, 10.2520], // Point 2: Near Carthage
    [36.8520, 10.2460], // Point 3: El Aouina
    [36.8580, 10.2410], // Point 4: North Airport bypass
    [36.8640, 10.2350], // Point 5: La Soukra
    [36.8660, 10.2260], // Point 6: Ennasr cross
    [36.8685, 10.2150], // Point 7: Chotrana
    [36.8670, 10.2070], // Point 8: Ariana East
    [36.8655, 10.1980], // Point 9 (CURRENT): Borj Louzir / Ariana (Last Emitted Position)
  ];

  // Active Vehicle State (Last emitted position at Borj Louzir)
  const [vehicleState, setVehicleState] = useState({
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    brand: 'MG',
    model: 'ZS',
    ref: 'MZ008',
    speed: 16,
    latitude: 36.8655,
    longitude: 10.1980,
    address: 'Borj Louzir',
    subAddress: 'V672+P56 Ariana',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    battery: 92,
    fuel: 85,
    doorsLocked: true,
  });

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [36.8520, 10.2280],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Initial Dotted Green Trajectory Line (from Lac II to Borj Louzir)
    const polyline = L.polyline(CHRONOLOGICAL_TUNIS_TRAJECTORY, {
      color: '#10B981', // Tailwind Emerald-500
      weight: 4,
      dashArray: '6, 12',
      lineCap: 'round',
    }).addTo(map);
    polylineRef.current = polyline;

    // Layer Group for Waypoint Dots
    const waypointGroup = L.layerGroup().addTo(map);
    waypointLayerRef.current = waypointGroup;

    // Green Waypoint Dots along the route
    const dotIcon = L.divIcon({
      className: '',
      html: `<div style="width: 12px; height: 12px; border-radius: 50%; background-color: #14b8a6; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    CHRONOLOGICAL_TUNIS_TRAJECTORY.forEach((coords) => {
      L.marker(coords, { icon: dotIcon }).addTo(waypointGroup);
    });

    // 2. RED ORIGIN PIN AT START POINT: Les Berges du Lac II
    const redOriginPinIcon = L.divIcon({
      className: '',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #dc2626; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const originMarker = L.marker([36.8375, 10.2450], { icon: redOriginPinIcon }).addTo(map);
    originMarker.bindPopup(`
      <div style="font-size: 11px; font-weight: bold; padding: 2px;">
        <span style="color: #dc2626;">● Trip Origin / Departure</span><br/>
        Les Berges du Lac II, Tunis
      </div>
    `);

    // 3. CAR MARKER AT LAST EMITTED LOCATION: Borj Louzir
    const carIcon = L.divIcon({
      className: '',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="width: 36px; height: 36px; border-radius: 12px; background-color: #0f172a; border: 2px solid #ffffff; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: -4px; width: 8px; height: 8px; background-color: #0f172a; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

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

    // Last Emitted Marker at Borj Louzir (Ariana)
    const carMarker = L.marker([36.8655, 10.1980], { icon: carIcon }).addTo(map);
    carMarker.bindPopup(popupHtml, { autoPan: false, closeButton: false }).openPopup();
    carMarkerRef.current = carMarker;

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Poll Live Telemetry & Chronological Trajectory
  const syncLiveData = useCallback(async () => {
    try {
      const liveRes = await apiRequest<{ fleet: any[] }>('/admin/fleet/live-map', {}, adminToken);
      if (liveRes.fleet && liveRes.fleet.length > 0) {
        const liveCar = liveRes.fleet.find((c) => c.latitude >= 30 && c.latitude <= 38) || liveRes.fleet[0];

        const isTunisiaRegion = liveCar.latitude >= 30 && liveCar.latitude <= 38;
        const targetLat = isTunisiaRegion ? liveCar.latitude : 36.8655;
        const targetLon = isTunisiaRegion ? liveCar.longitude : 10.1980;

        setVehicleState((prev) => ({
          ...prev,
          id: liveCar.vehicleId,
          latitude: targetLat,
          longitude: targetLon,
          speed: liveCar.speedKmh ?? prev.speed,
          battery: liveCar.batteryLevel ?? prev.battery,
          fuel: liveCar.fuelLevel ?? prev.fuel,
          doorsLocked: liveCar.doorsLocked,
        }));

        // Move car marker dynamically to latest emitted coordinates
        if (carMarkerRef.current && isTunisiaRegion) {
          carMarkerRef.current.setLatLng([targetLat, targetLon]);
        }

        // Fetch chronological trajectory from TimescaleDB (Lac II -> Borj Louzir)
        const trajectoryRes = await apiRequest<{ coordinates: [number, number][] }>(
          `/admin/fleet/${liveCar.vehicleId}/trajectory`,
          {},
          adminToken
        );

        if (trajectoryRes.coordinates && trajectoryRes.coordinates.length > 0) {
          const tunisCoords = trajectoryRes.coordinates.filter(
            ([lat]) => lat >= 30 && lat <= 38
          );

          if (tunisCoords.length > 0 && polylineRef.current) {
            polylineRef.current.setLatLngs(tunisCoords);

            if (waypointLayerRef.current) {
              waypointLayerRef.current.clearLayers();
              const dotIcon = L.divIcon({
                className: '',
                html: `<div style="width: 10px; height: 10px; border-radius: 50%; background-color: #14b8a6; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5],
              });

              tunisCoords.forEach((coords) => {
                L.marker(coords, { icon: dotIcon }).addTo(waypointLayerRef.current!);
              });
            }
          }
        }
      }
    } catch (e) {
      // Preserve current trajectory
    }
  }, [adminToken]);

  useEffect(() => {
    syncLiveData();
    const interval = setInterval(syncLiveData, 2000);
    return () => clearInterval(interval);
  }, [syncLiveData]);

  const toggleDoorLock = async () => {
    if (!vehicleState.id) return;
    const newLockState = !vehicleState.doorsLocked;
    const command = newLockState ? 'LOCK_DOORS' : 'UNLOCK_DOORS';

    try {
      await apiRequest(
        `/admin/fleet/${vehicleState.id}/command`,
        { method: 'POST', body: JSON.stringify({ command }) },
        adminToken
      );
      setVehicleState((prev) => ({ ...prev, doorsLocked: newLockState }));
    } catch (err: any) {
      alert(`Command failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
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
            syncLiveData().finally(() => setLoading(false));
          }}
          className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition"
          title="Refresh GPS positions"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm h-[720px] relative overflow-hidden">
        <div ref={mapContainerRef} className="h-full w-full rounded-2xl" />

        <div className="absolute bottom-6 left-6 right-6 z-[1000] pointer-events-none">
          <div className="max-w-2xl bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-2xl pointer-events-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={vehicleState.image}
                alt={vehicleState.model}
                className="w-16 h-10 object-contain"
              />
              <div>
                <p className="text-xs font-black text-slate-900">
                  {vehicleState.brand} {vehicleState.model} ({vehicleState.ref})
                </p>
                <p className="text-[11px] text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {vehicleState.address}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-bold text-slate-700">
              <div className="flex items-center">
                <Gauge className="w-4 h-4 text-slate-500 mr-1" />
                <span>{vehicleState.speed} km/h</span>
              </div>
              <div className="flex items-center">
                <BatteryCharging className="w-4 h-4 text-emerald-600 mr-1" />
                <span>{vehicleState.battery}%</span>
              </div>
              <div className="flex items-center">
                <Fuel className="w-4 h-4 text-blue-600 mr-1" />
                <span>{vehicleState.fuel}%</span>
              </div>
              <button
                onClick={toggleDoorLock}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center transition shadow-sm ${
                  vehicleState.doorsLocked
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {vehicleState.doorsLocked ? (
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