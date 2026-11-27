import React, { useState, useMemo, useEffect } from 'react';
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight 
} from 'lucide-react';
import { FleetVehicle, VehicleStatus } from '@cyphrdrive/contracts';

interface TableProps {
  vehicles: FleetVehicle[];
  onSelectVehicle: (vehicle: FleetVehicle) => void;
}

// All columns except "Action" are sortable
type SortField = 
  | 'id' 
  | 'ref' 
  | 'brand' 
  | 'model' 
  | 'transmission' 
  | 'fuel' 
  | 'power' 
  | 'firstReg' 
  | 'mileage' 
  | 'nextMaint' 
  | 'status';

type SortDirection = 'asc' | 'desc';

export const FleetTable: React.FC<TableProps> = ({ vehicles, onSelectVehicle }) => {
  const PAGE_SIZE = 14; // Matches wireframe (14 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Reset to page 1 whenever the vehicle list changes (e.g. filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [vehicles.length]);

  // Handle header click to toggle sorting (asc -> desc -> reset)
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper: Parses numeric power in kW (e.g. "66 kW (90 hp)" -> 66)
  const parsePower = (pStr?: string): number => {
    if (!pStr) return 0;
    const match = pStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Helper: Parses mileage (e.g. "64.204 km" -> 64204)
  const parseMileage = (mStr?: string): number => {
    if (!mStr) return 0;
    return parseInt(mStr.replace(/[^\d]/g, ''), 10) || 0;
  };

  // Helper: Parses dates in either "MM.YYYY" or "DD.MM.YYYY" format into comparable integers
  const parseDateString = (dStr?: string): number => {
    if (!dStr) return 0;
    const parts = dStr.split('.');
    if (parts.length === 2) {
      // MM.YYYY -> YYYYMM (e.g. "01.2024" -> 202401)
      return parseInt(parts[1] + parts[0], 10) || 0;
    }
    if (parts.length === 3) {
      // DD.MM.YYYY -> YYYYMMDD (e.g. "15.08.2026" -> 20260815)
      return parseInt(parts[2] + parts[1] + parts[0], 10) || 0;
    }
    return 0;
  };

  // 1. Sort Vehicles
  const sortedVehicles = useMemo(() => {
    if (!sortField) return vehicles;

    return [...vehicles].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'id':
          aVal = parseInt(a.displayId || a.id.replace(/[^\d]/g, ''), 10) || 0;
          bVal = parseInt(b.displayId || b.id.replace(/[^\d]/g, ''), 10) || 0;
          break;
        case 'ref':
          aVal = (a.ref || '').toLowerCase();
          bVal = (b.ref || '').toLowerCase();
          break;
        case 'brand':
          aVal = (a.brand || '').toLowerCase();
          bVal = (b.brand || '').toLowerCase();
          break;
        case 'model':
          aVal = (a.model || '').toLowerCase();
          bVal = (b.model || '').toLowerCase();
          break;
        case 'transmission':
          aVal = (a.transmission || '').toLowerCase();
          bVal = (b.transmission || '').toLowerCase();
          break;
        case 'fuel':
          aVal = (a.fuel || '').toLowerCase();
          bVal = (b.fuel || '').toLowerCase();
          break;
        case 'power':
          aVal = parsePower(a.power);
          bVal = parsePower(b.power);
          break;
        case 'firstReg':
          aVal = parseDateString(a.firstReg);
          bVal = parseDateString(b.firstReg);
          break;
        case 'mileage':
          aVal = parseMileage(a.mileage);
          bVal = parseMileage(b.mileage);
          break;
        case 'nextMaint':
          aVal = parseDateString(a.nextMaint);
          bVal = parseDateString(b.nextMaint);
          break;
        case 'status':
          aVal = (a.status || '').toLowerCase();
          bVal = (b.status || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vehicles, sortField, sortDirection]);

  // 2. Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(sortedVehicles.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, sortedVehicles.length);
  const paginatedVehicles = sortedVehicles.slice(startIndex, endIndex);

  // Render Sort Header Indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-300 inline opacity-60" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1 text-blue-600 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-blue-600 inline" />
    );
  };

  // Status Badge Pill Renderer matching the screenshot
  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500 text-white shadow-sm">available</span>;
      case 'picked-up':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm">picked-up</span>;
      case 'booked':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">booked</span>;
      case 'service':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-white shadow-sm">service</span>;
      case 'issue':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm">issue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-400 text-white">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-semibold select-none">
            <tr>
              {/* 1. ID */}
              <th 
                className="py-3 px-4 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">ID {renderSortIndicator('id')}</div>
              </th>

              {/* 2. Ref */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('ref')}
              >
                <div className="flex items-center">Ref. {renderSortIndicator('ref')}</div>
              </th>

              {/* 3. Brand */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center">Brand {renderSortIndicator('brand')}</div>
              </th>

              {/* 4. Model */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('model')}
              >
                <div className="flex items-center">Model {renderSortIndicator('model')}</div>
              </th>

              {/* 5. Transmission (Now Sortable) */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('transmission')}
              >
                <div className="flex items-center">Transmission {renderSortIndicator('transmission')}</div>
              </th>

              {/* 6. Fuel (Now Sortable) */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('fuel')}
              >
                <div className="flex items-center">Fuel {renderSortIndicator('fuel')}</div>
              </th>

              {/* 7. Power (Now Sortable) */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('power')}
              >
                <div className="flex items-center">Power {renderSortIndicator('power')}</div>
              </th>

              {/* 8. First reg. */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('firstReg')}
              >
                <div className="flex items-center">First reg. {renderSortIndicator('firstReg')}</div>
              </th>

              {/* 9. Mileage */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('mileage')}
              >
                <div className="flex items-center">Mileage {renderSortIndicator('mileage')}</div>
              </th>

              {/* 10. Next maint. (Now Sortable) */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('nextMaint')}
              >
                <div className="flex items-center">Next maint. {renderSortIndicator('nextMaint')}</div>
              </th>

              {/* 11. Status */}
              <th 
                className="py-3 px-3 cursor-pointer hover:text-slate-800 transition"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">Status {renderSortIndicator('status')}</div>
              </th>

              {/* 12. Action (Unsorted) */}
              <th className="py-3 px-3">Action</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedVehicles.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-400 font-medium">
                  No vehicles found.
                </td>
              </tr>
            ) : (
              paginatedVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                    {v.displayId || v.id.replace(/[^\d]/g, '').slice(-6)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 font-mono">
                    {v.ref}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {v.brand}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {v.model}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {v.transmission}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {v.fuel}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {v.power}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {v.firstReg}
                  </td>
                  <td className="py-3 px-3 text-slate-900 font-bold font-mono">
                    {v.mileage}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {v.nextMaint}
                  </td>
                  <td className="py-3 px-3">
                    {getStatusBadge(v.status)}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onSelectVehicle(v)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                    >
                      details
                    </button>
                  </td>
                  <td className="py-3 px-2 text-slate-400 cursor-pointer hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Bar: Range Counter & Working Pagination Controls */}
      <div className="py-3.5 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="font-mono text-slate-500">
          Showing {sortedVehicles.length === 0 ? '0' : `${startIndex + 1}-${endIndex}`} of {sortedVehicles.length} vehicles
        </div>

        <div className="flex items-center space-x-3 select-none">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 transition"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 transition"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-slate-900 px-1 font-mono">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 transition"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 transition"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};