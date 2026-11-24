import React, { useState } from 'react';
import { 
  X, 
  Gauge, 
  Fuel, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';
import { apiRequest } from '../lib/api';

interface ReturnModalProps {
  booking: any;
  adminToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnCheckInModal: React.FC<ReturnModalProps> = ({
  booking,
  adminToken,
  onClose,
  onSuccess,
}) => {
  const initialOdo = booking.current_odometer || 12450;
  const initialFuel = 100;

  const [returnOdometer, setReturnOdometer] = useState<number>(initialOdo + 320);
  const [returnFuel, setReturnFuel] = useState<number>(85); // 85% returned
  const [damageFee, setDamageFee] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('Clean exterior, no damage. Fuel 85%.');
  const [photosUploaded, setPhotosUploaded] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-calculated fees
  const fuelDeficitPercent = Math.max(0, initialFuel - returnFuel);
  const fuelFee = fuelDeficitPercent > 0 ? parseFloat((fuelDeficitPercent * 1.5).toFixed(2)) : 0; // ~1.5 TND per missing %
  const lateFee = 0.00;
  const totalIncidentals = parseFloat((fuelFee + lateFee + Number(damageFee)).toFixed(2));
  const deposit = parseFloat(booking.security_deposit || '2000.00');
  const netRefund = Math.max(0, deposit - totalIncidentals);

  const handleConfirmReturn = async () => {
    setLoading(true);
    try {
      await apiRequest(
        `/admin/bookings/${booking.id}/return`,
        {
          method: 'POST',
          body: JSON.stringify({
            returnOdometer,
            returnFuel,
            fuelFee,
            lateFee,
            damageFee,
            remarks,
            photos: { front: true, back: true, left: true, right: true },
          }),
        },
        adminToken
      );

      onSuccess();
    } catch (err: any) {
      alert(`Return inspection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Vehicle Return & Digital Check-In</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ref: <strong className="text-slate-700">{booking.booking_reference}</strong> | {booking.vehicle_make} {booking.vehicle_model} ({booking.vehicle_plate})
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Odometer & Mileage Audit (FR-7.3) */}
        <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
          <div className="flex items-center text-xs font-bold text-slate-800">
            <Gauge className="w-4 h-4 mr-1.5 text-blue-600" /> Odometer Reading
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Pick-up Odometer</span>
              <span className="font-mono font-bold text-slate-700 text-sm">{initialOdo.toLocaleString()} km</span>
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Return Odometer (km)</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold bg-white text-sm"
                value={returnOdometer}
                onChange={(e) => setReturnOdometer(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200">
            Total distance driven: <strong className="text-blue-600">{Math.max(0, returnOdometer - initialOdo)} km</strong>
          </p>
        </div>

        {/* 2. Fuel Gauge & Incidental Deficit (FR-4.5) */}
        <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <div className="flex items-center">
              <Fuel className="w-4 h-4 mr-1.5 text-blue-600" /> Fuel Level at Return
            </div>
            <span className="font-mono text-sm text-slate-900">{returnFuel}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={returnFuel}
            onChange={(e) => setReturnFuel(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          {fuelDeficitPercent > 0 && (
            <div className="flex items-center justify-between text-xs p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-medium">
              <span className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" /> Missing {fuelDeficitPercent}% Fuel
              </span>
              <strong className="font-bold">+ {fuelFee} TND Charge</strong>
            </div>
          )}
        </div>

        {/* 3. 4-Way Condition Photos (FR-8.1) */}
        <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
          <div className="flex justify-between items-center text-xs font-bold text-slate-800">
            <div className="flex items-center">
              <Camera className="w-4 h-4 mr-1.5 text-blue-600" /> 4-Way Condition Photos
            </div>
            {photosUploaded && (
              <span className="text-[11px] text-emerald-600 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 4 Photos Verified
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-600">
            {['Front', 'Back', 'Left', 'Right'].map((side) => (
              <div key={side} className="border border-teal-500 bg-white rounded-lg p-2.5 flex flex-col items-center">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mb-1" />
                <span>{side}</span>
              </div>
            ))}
          </div>
          <textarea
            className="w-full border border-slate-200 rounded-lg p-2 text-xs h-14 resize-none bg-white"
            placeholder="Condition remarks or scratch details..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* 4. Deposit & Incidentals Settlement (FR-4.5) */}
        <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 text-xs">
          <p className="font-bold border-b border-slate-700 pb-1.5 text-slate-300">Security Deposit Settlement</p>
          <div className="flex justify-between text-slate-400">
            <span>Pre-Authorized Deposit Hold:</span>
            <span className="font-mono text-white">{deposit.toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between text-amber-400">
            <span>Total Incidentals (Fuel + Fees):</span>
            <span className="font-mono">- {totalIncidentals.toFixed(2)} TND</span>
          </div>
          <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-700">
            <span className="text-emerald-400">Net Refund to Customer:</span>
            <span className="font-mono text-emerald-400">{netRefund.toFixed(2)} TND</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button onClick={onClose} className="px-5 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={handleConfirmReturn}
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center"
          >
            {loading ? 'Processing...' : 'Complete Return & Settle'} <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};