import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  RefreshCw, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus 
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { ReturnCheckInModal } from './ReturnCheckInModal';

interface BookingManagementProps {
  adminToken: string;
  onNewBookingClick: () => void;
}

export const BookingManagement: React.FC<BookingManagementProps> = ({
  adminToken,
  onNewBookingClick,
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReturnBooking, setSelectedReturnBooking] = useState<any | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ bookings: any[] }>(
        `/admin/bookings?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`,
        {},
        adminToken
      );
      setBookings(data.bookings);
    } catch (err: any) {
      console.error('Failed to load bookings:', err.message);
    } finally {
      setLoading(false);
    }
  }, [adminToken, statusFilter, searchQuery]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle Handover (Pick-up check-in)
  const handleHandover = async (bookingId: string) => {
    if (!confirm('Confirm vehicle handover and mark as ACTIVE?')) return;
    try {
      await apiRequest(
        `/admin/bookings/${bookingId}/handover`,
        { method: 'POST', body: JSON.stringify({ initialOdometer: 12450, initialFuel: 100 }) },
        adminToken
      );
      fetchBookings();
    } catch (err: any) {
      alert(`Handover failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500 text-white flex items-center w-max"><Clock className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500 text-white flex items-center w-max"><KeyRound className="w-3 h-3 mr-1" /> Active</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white flex items-center w-max"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-400 text-white">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewBookingClick}
            className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl flex items-center transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Booking
          </button>

          {/* Search Input */}
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search reference, customer, plate..."
              className="outline-none w-56 text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active (Picked-Up)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={fetchBookings} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xl font-black text-slate-900">
            {bookings.length} <span className="text-xs font-normal text-slate-400">reservations</span>
          </span>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ref.</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Vehicle</th>
                <th className="py-3.5 px-3">Dates</th>
                <th className="py-3.5 px-3">Total</th>
                <th className="py-3.5 px-3">Deposit</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? 'Loading reservations...' : 'No bookings found.'}
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.booking_reference}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{b.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{b.customer_phone}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{b.vehicle_make} {b.vehicle_model}</p>
                      <p className="text-[11px] font-mono text-slate-400">{b.vehicle_plate}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-700">{new Date(b.start_time).toLocaleDateString()}</p>
                      <p className="text-[11px] text-slate-400">to {new Date(b.end_time).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{b.total_price} TND</td>
                    <td className="py-3.5 px-3 font-medium text-amber-600">{b.security_deposit} TND</td>
                    <td className="py-3.5 px-3">{getStatusBadge(b.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {/* Contextual Action Button */}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleHandover(b.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition shadow-sm"
                        >
                          Handover (Pick-up)
                        </button>
                      )}

                      {b.status === 'ACTIVE' && (
                        <button
                          onClick={() => setSelectedReturnBooking(b)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition shadow-sm"
                        >
                          Return Check-In
                        </button>
                      )}

                      {b.status === 'COMPLETED' && (
                        <span className="text-[11px] font-semibold text-slate-400">Inspected & Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Inspection Modal */}
      {selectedReturnBooking && (
        <ReturnCheckInModal
          booking={selectedReturnBooking}
          adminToken={adminToken}
          onClose={() => setSelectedReturnBooking(null)}
          onSuccess={() => {
            setSelectedReturnBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};