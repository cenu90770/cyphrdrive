import React from 'react';
import { FleetVehicle, VehicleStatus } from '../data/fleetData';

interface GridProps {
  vehicles: FleetVehicle[];
  onSelectVehicle: (vehicle: FleetVehicle) => void;
  onBookVehicle?: (vehicle: FleetVehicle) => void;
}

export const FleetGrid: React.FC<GridProps> = ({ vehicles, onSelectVehicle, onBookVehicle }) => {
  const getBadgeClass = (status: VehicleStatus) => {
    switch (status) {
      case 'available': return 'bg-teal-500 text-white';
      case 'picked-up': return 'bg-indigo-400 text-white';
      case 'booked': return 'bg-orange-400 text-white';
      case 'service': return 'bg-amber-400 text-white';
      case 'issue': return 'bg-rose-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {vehicles.map((v, index) => {
        const slotNumber = String(index + 1).padStart(3, '0');
        const isAvailable = v.status === 'available';

        return (
          <div
            key={v.id}
            onClick={() => onSelectVehicle(v)}
            className="group bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between h-56 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden"
          >
            {/* Status Pill */}
            <div className="flex justify-end z-10">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getBadgeClass(v.status)}`}>
                {v.status}
              </span>
            </div>

            {/* Vehicle Image or Slot Number */}
            <div className="flex-1 flex items-center justify-center">
              {v.image ? (
                <img src={v.image} alt={v.model} className="max-h-24 object-contain" />
              ) : (
                <span className="text-4xl font-extrabold text-slate-200 font-mono tracking-wider">
                  {slotNumber}
                </span>
              )}
            </div>

            {/* Hover "Book" Overlay */}
            {isAvailable && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onBookVehicle?.(v);
                }}
                className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[1px]"
              >
                <button className="px-5 py-2 bg-white text-slate-900 hover:bg-slate-100 font-black text-sm rounded-xl shadow-xl transition transform scale-95 group-hover:scale-100">
                  Book
                </button>
              </div>
            )}

            {/* Vehicle Info */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline z-10">
              <div>
                <p className="text-xs font-bold text-slate-800">{v.brand} {v.model}</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">{v.ratePerDay}<span className="text-[10px] text-slate-400 font-normal">/day</span></p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{v.ref}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};