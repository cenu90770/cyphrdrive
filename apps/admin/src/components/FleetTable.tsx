import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { FleetVehicle, VehicleStatus } from '../data/fleetData';

interface TableProps {
  vehicles: FleetVehicle[];
  onSelectVehicle: (vehicle: FleetVehicle) => void;
}

export const FleetTable: React.FC<TableProps> = ({ vehicles, onSelectVehicle }) => {
  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500 text-white">available</span>;
      case 'picked-up':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-400 text-white">picked-up</span>;
      case 'booked':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-400 text-white">booked</span>;
      case 'service':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400 text-white">service</span>;
      case 'issue':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500 text-white">issue</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-3">Ref.</th>
              <th className="py-3 px-3">Brand</th>
              <th className="py-3 px-3">Model</th>
              <th className="py-3 px-3">Transmission</th>
              <th className="py-3 px-3">Fuel</th>
              <th className="py-3 px-3">Power</th>
              <th className="py-3 px-3">First reg.</th>
              <th className="py-3 px-3">Mileage</th>
              <th className="py-3 px-3">Next maint.</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Action</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">{v.id}</td>
                <td className="py-3 px-3 font-semibold text-slate-700">{v.ref}</td>
                <td className="py-3 px-3 text-slate-900 font-medium">{v.brand}</td>
                <td className="py-3 px-3 text-slate-700">{v.model}</td>
                <td className="py-3 px-3 text-slate-500">{v.transmission}</td>
                <td className="py-3 px-3 text-slate-500">{v.fuel}</td>
                <td className="py-3 px-3 text-slate-500">{v.power}</td>
                <td className="py-3 px-3 text-slate-500">{v.firstReg}</td>
                <td className="py-3 px-3 text-slate-800 font-medium">{v.mileage}</td>
                <td className="py-3 px-3 text-slate-500">{v.nextMaint}</td>
                <td className="py-3 px-3">{getStatusBadge(v.status)}</td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => onSelectVehicle(v)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    details
                  </button>
                </td>
                <td className="py-3 px-2 text-slate-400 cursor-pointer hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar (page 15: |< < 1 / 4 > >|) */}
      <div className="py-3 px-4 border-t border-slate-100 flex items-center justify-center space-x-4 text-xs text-slate-500 font-medium">
        <button className="hover:text-slate-900">|&lt;</button>
        <button className="hover:text-slate-900">&lt;</button>
        <span className="text-slate-800 font-semibold px-2">1 / 4</span>
        <button className="hover:text-slate-900">&gt;</button>
        <button className="hover:text-slate-900">&gt;|</button>
      </div>
    </div>
  );
};