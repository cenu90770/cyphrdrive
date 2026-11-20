import React, { useState } from 'react';
import { 
  Calendar, MapPin, Car, ShieldCheck, CreditCard, 
  CheckCircle2, AlertCircle, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { apiRequest } from '../lib/api';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel_type: string;
  base_daily_rate: string;
  distance_km: string;
  branch_id: string;
}

export const BookingWizard: React.FC<{ customerToken: string }> = ({ customerToken }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Search Criteria
  const [searchParams, setSearchParams] = useState({
    latitude: 52.5200,
    longitude: 13.4050,
    radiusKm: 30,
    startTime: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] + 'T10:00:00.000Z',
    endTime: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0] + 'T10:00:00.000Z',
  });

  // Step 2: Available Vehicles & Selection
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Step 3: Add-Ons
  const [addOns, setAddOns] = useState<string[]>([]);

  // Step 4: KYC Document Scan Simulation
  const [kycSubmitted, setKycSubmitted] = useState<boolean>(false);

  // Step 5: Confirmed Booking Details
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);

  // --- Step 1 Action: Fetch Vehicles ---
  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const url = `/vehicles/search?latitude=${searchParams.latitude}&longitude=${searchParams.longitude}&radiusKm=${searchParams.radiusKm}&startTime=${encodeURIComponent(searchParams.startTime)}&endTime=${encodeURIComponent(searchParams.endTime)}`;
      const data = await apiRequest<{ vehicles: Vehicle[] }>(url);
      setVehicles(data.vehicles);
      if (data.vehicles.length === 0) {
        setErrorMessage('No vehicles available for these dates and location.');
      } else {
        setStep(2);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 4 Action: Submit KYC ---
  const handleKycVerification = () => {
    setKycSubmitted(true);
    setStep(5);
  };

  // --- Step 5 Action: Acquire Hold & Confirm Payment ---
  const handleFinalPayment = async () => {
    if (!selectedVehicle) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      // Phase 1: Initiate Anti-Double-Booking Hold (FR-3.1, FR-3.5)
      const holdData = await apiRequest<any>(
        '/bookings/hold',
        {
          method: 'POST',
          body: JSON.stringify({
            vehicleId: selectedVehicle.id,
            pickupBranchId: selectedVehicle.branch_id,
            dropoffBranchId: selectedVehicle.branch_id,
            startTime: searchParams.startTime,
            endTime: searchParams.endTime,
            addOns,
          }),
        },
        customerToken
      );

      // Phase 2: Confirm Payment & Settle (FR-3.4)
      const confirmed = await apiRequest<any>(
        `/bookings/${holdData.booking_reference}/confirm`,
        {
          method: 'POST',
          body: JSON.stringify({ paymentIntentId: 'pi_ui_demo_capture_123' }),
        },
        customerToken
      );

      setBookingConfirmation(confirmed);
      setStep(6); // Success View
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Search' },
    { num: 2, label: 'Vehicle' },
    { num: 3, label: 'Add-Ons' },
    { num: 4, label: 'ID Verification' },
    { num: 5, label: 'Payment' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl my-8 border border-slate-100">
      {/* 5-Step Accessible Progress Bar (NFR-3.2) */}
      <nav aria-label="Booking Progress" className="mb-8">
        <ol className="flex items-center justify-between">
          {stepsHeader.map((s) => (
            <li key={s.num} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step >= s.num
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className="text-xs font-semibold mt-2 text-slate-600">{s.label}</span>
              </div>
              {s.num < 5 && (
                <div className={`h-1 flex-1 mx-2 ${step > s.num ? 'bg-brand-600' : 'bg-slate-100'}`} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center rounded">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* --- STEP 1: DATES & LOCATION SEARCH --- */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <MapPin className="mr-2 text-brand-600" /> Choose Pickup Location & Dates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border p-3 rounded-lg border-slate-200 focus:ring-2 focus:ring-brand-500"
                value={searchParams.startTime.slice(0, 16)}
                onChange={(e) => setSearchParams({ ...searchParams, startTime: new Date(e.target.value).toISOString() })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Return Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border p-3 rounded-lg border-slate-200 focus:ring-2 focus:ring-brand-500"
                value={searchParams.endTime.slice(0, 16)}
                onChange={(e) => setSearchParams({ ...searchParams, endTime: new Date(e.target.value).toISOString() })}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center text-lg"
          >
            {loading ? 'Searching Fleet...' : 'Search Available Vehicles'} <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      )}

      {/* --- STEP 2: SELECT VEHICLE --- */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Car className="mr-2 text-brand-600" /> Select Your Vehicle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((car) => (
              <div
                key={car.id}
                onClick={() => setSelectedVehicle(car)}
                className={`p-5 border-2 rounded-2xl cursor-pointer transition ${
                  selectedVehicle?.id === car.id
                    ? 'border-brand-600 bg-brand-50/30 shadow-md'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{car.make} {car.model}</h3>
                    <p className="text-xs font-semibold uppercase text-brand-600 tracking-wider mt-1">{car.category}</p>
                  </div>
                  <span className="text-2xl font-extrabold text-slate-900">€{car.base_daily_rate}<span className="text-xs text-slate-500 font-normal">/day</span></span>
                </div>
                <div className="mt-4 flex gap-2 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">{car.transmission}</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">{car.fuel_type}</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">{car.distance_km} km away</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 border rounded-lg flex items-center text-slate-600"><ArrowLeft className="mr-2 w-4 h-4" /> Back</button>
            <button
              disabled={!selectedVehicle}
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg disabled:opacity-50 flex items-center"
            >
              Continue to Extras <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 3: ADD-ONS & EXTRAS --- */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Customize Extras & Insurance</h2>
          <div className="space-y-3">
            {[
              { id: 'INSURANCE_PREMIUM', name: 'Premium Damage Protection', price: '€22.00/day' },
              { id: 'GPS_NAVIGATION', name: 'Integrated GPS Navigation', price: '€12.00/day' },
              { id: 'CHILD_SEAT', name: 'Safety Child Seat', price: '€9.50/day' },
            ].map((addon) => (
              <label
                key={addon.id}
                className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-slate-50"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                    checked={addOns.includes(addon.id)}
                    onChange={(e) => {
                      if (e.target.checked) setAddOns([...addOns, addon.id]);
                      else setAddOns(addOns.filter((id) => id !== addon.id));
                    }}
                  />
                  <span className="ml-3 font-semibold text-slate-800">{addon.name}</span>
                </div>
                <span className="font-bold text-slate-700">{addon.price}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 border rounded-lg flex items-center text-slate-600"><ArrowLeft className="mr-2 w-4 h-4" /> Back</button>
            <button onClick={() => setStep(4)} className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg flex items-center">
              Verify Identity <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 4: KYC & DRIVER'S LICENSE --- */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <ShieldCheck className="mr-2 text-brand-600" /> Identity & Driver's License (FR-1.4)
          </h2>
          <p className="text-sm text-slate-500">
            Local regulations require verified identity before release of vehicle. Upload your driver's license.
          </p>
          <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center bg-slate-50/50">
            <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            <p className="text-xs text-slate-400 mt-2">Driver's License Front & Back (JPEG, PNG, max 10MB)</p>
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(3)} className="px-5 py-2.5 border rounded-lg flex items-center text-slate-600"><ArrowLeft className="mr-2 w-4 h-4" /> Back</button>
            <button onClick={handleKycVerification} className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg flex items-center">
              Continue to Payment <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 5: REVIEW, SECURITY HOLD & PAYMENT --- */}
      {step === 5 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <CreditCard className="mr-2 text-brand-600" /> Payment & Security Deposit Hold
          </h2>
          <div className="p-5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Selected Vehicle:</span>
              <span className="font-bold text-slate-900">{selectedVehicle?.make} {selectedVehicle?.model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Security Deposit Hold (FR-4.5):</span>
              <span className="font-bold text-amber-600">€500.00 (Pre-authorized)</span>
            </div>
            <p className="text-xs text-slate-400 pt-2 border-t">
              *The €500 security deposit is a temporary pre-authorization hold on your card and will be released after vehicle return inspection.
            </p>
          </div>

          <button
            onClick={handleFinalPayment}
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center text-lg"
          >
            {loading ? 'Securing Hold & Reserving...' : 'Confirm Reservation & Pay'}
          </button>
        </div>
      )}

      {/* --- SUCCESS VIEW --- */}
      {step === 6 && bookingConfirmation && (
        <div className="text-center py-10 space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Booking Confirmed!</h2>
          <p className="text-slate-600">Your reservation code is <strong className="text-brand-600 font-mono text-xl">{bookingConfirmation.booking_reference}</strong></p>
          <div className="p-4 bg-slate-50 max-w-sm mx-auto rounded-lg text-sm text-slate-600">
            Total Paid: <strong>€{bookingConfirmation.total_price}</strong> | Deposit Pre-Authorized: <strong>€{bookingConfirmation.security_deposit}</strong>
          </div>
        </div>
      )}
    </div>
  );
};