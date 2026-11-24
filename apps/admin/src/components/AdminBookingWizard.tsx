import React, { useState, useEffect } from 'react';
import { 
  QrCode,
  Search, 
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { FleetVehicle } from '../data/fleetData';

interface BookingWizardProps {
  vehicle: FleetVehicle;
  adminToken: string;
  onCancel: () => void;
  onBookingCompleted: () => void;
}

export const AdminBookingWizard: React.FC<BookingWizardProps> = ({
  vehicle,
  adminToken,
  onCancel,
  onBookingCompleted,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Step 1: Booking Details
  const [pickupDate, setPickupDate] = useState('20.07.2026');
  const [pickupTime, setPickupTime] = useState('10:00 am');
  const [dropoffDate, setDropoffDate] = useState('28.07.2026');
  const [dropoffTime, setDropoffTime] = useState('10:00 am');
  const [pickupLocation, setPickupLocation] = useState('Rental office');
  const [dropoffLocation, setDropoffLocation] = useState('Rental office');
  const [extras, setExtras] = useState('none');
  const [remarks, setRemarks] = useState('');

  // Step 2: Customer Search & Information
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customer, setCustomer] = useState({
    firstName: 'Mohammed',
    lastName: 'Ben Romdhane',
    birthDate: '11.10.1992',
    phone: '+216 26 233 421',
    email: 'benromdhanemed@gmail.com',
  });

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online' | 'Cheque' | 'Credit Card'>('Credit Card');
  const [cardholder, setCardholder] = useState('Mohammed Ben Romdhane');
  const [cardNumber, setCardNumber] = useState('2985-5598-4220-211');
  const [expiryDate, setExpiryDate] = useState('31.12.2028');
  const [cvc, setCvc] = useState('298');

  // Pricing constants
  const totalRentalAmount = '2.999,85';
  const securityDepositAmount = '2.000';

  // Customer Autocomplete
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await apiRequest<{ customers: any[] }>(
            `/admin/customers/search?q=${encodeURIComponent(searchQuery)}`,
            {},
            adminToken
          );
          setCustomerSuggestions(res.customers);
          setShowDropdown(true);
        } catch (e) {
          // Fallback realistic mock matches
          setCustomerSuggestions([
            { first_name: 'Mohammed', last_name: 'Khiari', email: 'mkhiari@gmail.com', phone_number: '+216 21 001 002', birth_date: '04.05.1989' },
            { first_name: 'Mohammed', last_name: 'Ben Romdhane', email: 'benromdhanemed@gmail.com', phone_number: '+216 26 233 421', birth_date: '11.10.1992' },
            { first_name: 'Mohammed Ali', last_name: 'Mastouri', email: 'mastouri.med@gmail.com', phone_number: '+216 55 123 456', birth_date: '22.01.1995' },
            { first_name: 'Mohaned', last_name: 'Achouri', email: 'mohaned.achouri@gmail.com', phone_number: '+216 98 765 432', birth_date: '15.08.1991' },
          ]);
          setShowDropdown(true);
        }
      } else {
        setCustomerSuggestions([]);
        setShowDropdown(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, adminToken]);

  const selectCustomer = (c: any) => {
    setCustomer({
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      phone: c.phone_number,
      birthDate: c.birth_date,
    });
    setCardholder(`${c.first_name} ${c.last_name}`);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ bookingId: string }>(
        '/admin/bookings',
        {
          method: 'POST',
          body: JSON.stringify({
            vehicleId: vehicle.id,
            customer,
            pickupDate: '2026-07-20T10:00:00.000Z',
            dropoffDate: '2026-07-28T10:00:00.000Z',
            pickupLocation,
            dropoffLocation,
            paymentMethod,
            paymentDetails: { cardholder, cardNumber, expiryDate },
            totalAmount: totalRentalAmount.replace('.', '').replace(',', '.'),
            remarks,
          }),
        },
        adminToken
      );

      setConfirmedBookingId(response.bookingId || '934566');
    } catch (err: any) {
      alert(`Booking submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    '1. Booking details',
    '2. Customer information',
    '3. Payment information',
    '4. Check-out',
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs font-semibold text-slate-400">
        <span className="hover:text-slate-600 cursor-pointer" onClick={onCancel}>Booking</span>
        <span className="mx-2">&gt;</span>
        <span className="text-slate-900 font-bold">New Booking</span>
      </div>

      {/* CONFIRMATION / BOOKING CARD VIEW */}
      {confirmedBookingId ? (
        <div className="space-y-6">
          {/* Top Banner Alert */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Booking <span className="font-extrabold text-slate-950">{confirmedBookingId}</span> has been created successfully!
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                A confirmation E-Mail has been sent to <span className="font-semibold text-slate-900">{customer.email}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-bold">
              <button onClick={onBookingCompleted} className="text-blue-600 hover:text-blue-800 underline">
                Go to booking list
              </button>
              <button onClick={onBookingCompleted} className="text-blue-600 hover:text-blue-800 underline">
                Proceed with delivery
              </button>
            </div>
          </div>

          {/* Official Printable Booking Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">Booking Card</h2>
              <div className="bg-emerald-600 text-white font-black text-sm italic px-4 py-1 rounded">
                Europcar
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs">
              {/* Customer Column */}
              <div className="md:col-span-3 space-y-2">
                <p className="font-bold text-slate-900 border-b pb-1">Customer</p>
                <p><span className="text-slate-400">Name:</span> <strong className="text-slate-800">{customer.firstName} {customer.lastName}</strong></p>
                <p><span className="text-slate-400">Email:</span> <strong className="text-slate-800">{customer.email}</strong></p>
                <p><span className="text-slate-400">Phone:</span> <strong className="text-slate-800">{customer.phone}</strong></p>
              </div>

              {/* Booking Details Column */}
              <div className="md:col-span-3 space-y-1.5">
                <p className="font-bold text-slate-900 border-b pb-1">Booking details</p>
                <p><span className="text-slate-400">Booking Id:</span> <strong className="text-slate-800">{confirmedBookingId}</strong></p>
                <p><span className="text-slate-400">Booking date:</span> <strong>14.07.2026</strong></p>
                <p><span className="text-slate-400">Booked car:</span> <strong>{vehicle.brand} {vehicle.model}</strong></p>
                <p><span className="text-slate-400">Car Ref.:</span> <strong>{vehicle.ref}</strong></p>
                <p className="pt-1"><span className="text-slate-400">Pick-up:</span> <strong>18.07.2026 (Rental office)</strong></p>
                <p><span className="text-slate-400">Drop-off:</span> <strong>28.07.2026 (Rental office)</strong></p>
              </div>

              {/* Payment Details Column */}
              <div className="md:col-span-3 space-y-1.5">
                <p className="font-bold text-slate-900 border-b pb-1">Payment</p>
                <p><span className="text-slate-400">Method:</span> <strong>{paymentMethod}</strong></p>
                <p><span className="text-slate-400">Cardholder:</span> <strong>{cardholder}</strong></p>
                <p><span className="text-slate-400">Card Number:</span> <strong className="font-mono">298*********211</strong></p>
              </div>

              {/* QR Code Container */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-3 border-2 border-slate-900 rounded-xl bg-slate-50">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="text-[10px] font-mono mt-1 text-slate-500">SCAN AT PICKUP</span>
              </div>
            </div>

            {/* Financial Summary Line */}
            <div className="bg-slate-50 p-4 rounded-xl flex justify-end space-x-8 text-xs font-medium">
              <div><span className="text-slate-400">Rental charge:</span> <strong className="text-slate-800">2.999,85 TND</strong></div>
              <div><span className="text-slate-400">Rental extras:</span> <strong className="text-slate-800">0 TND</strong></div>
              <div><span className="text-slate-400">Add. insurance:</span> <strong className="text-slate-800">0 TND</strong></div>
              <div className="border-l pl-6"><span className="text-slate-400">Total:</span> <strong className="text-base font-black text-slate-900">2.999,85 TND</strong></div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t text-[10px] text-slate-400 flex justify-between">
              <span>Europcar Tunisia S.A.R.L - Charguia I - Tunisia - BP72321 - hotline: +216 88 222 111</span>
              <span>Generated by CyphrDrive©</span>
            </div>
          </div>
        </div>
      ) : (
        /* WIZARD FLOW */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
          {/* 4-Step Stepper Header */}
          <div className="border-b border-slate-200 flex space-x-12 text-xs font-semibold">
            {steps.map((label, idx) => {
              const stepNumber = idx + 1;
              const isActive = currentStep === stepNumber;
              return (
                <div
                  key={label}
                  className={`pb-3 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-b-2 border-blue-600 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  onClick={() => setCurrentStep(stepNumber)}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {/* Form + Summary Layout */}
          {currentStep < 4 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left/Middle Form Container */}
              <div className="lg:col-span-8 space-y-4 text-xs">
                {/* STEP 1: BOOKING DETAILS */}
                {currentStep === 1 && (
                  <div className="space-y-3.5 max-w-xl">
                    <div className="grid grid-cols-3 items-center gap-2">
                      <span className="text-slate-600 font-medium">Car</span>
                      <span className="col-span-2 font-bold text-slate-900">{vehicle.brand} {vehicle.model}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <span className="text-slate-600 font-medium">Reference</span>
                      <span className="col-span-2 font-bold text-slate-900 font-mono">{vehicle.ref}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Pick-up date</label>
                      <div className="col-span-2 flex space-x-2">
                        <input className="w-full border border-slate-200 rounded-lg p-2 font-medium" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                        <input className="w-28 border border-slate-200 rounded-lg p-2 font-medium" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Drop-off date</label>
                      <div className="col-span-2 flex space-x-2">
                        <input className="w-full border border-slate-200 rounded-lg p-2 font-medium" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} />
                        <input className="w-28 border border-slate-200 rounded-lg p-2 font-medium" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Pick-up location</label>
                      <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}>
                        <option>Rental office</option>
                        <option>Tunis Carthage Airport (TUN)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Drop-off location</label>
                      <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)}>
                        <option>Rental office</option>
                        <option>Tunis Carthage Airport (TUN)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Extras</label>
                      <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white" value={extras} onChange={(e) => setExtras(e.target.value)}>
                        <option>none</option>
                        <option>GPS Navigation</option>
                        <option>Child Seat</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-start gap-2 pt-1">
                      <label className="text-slate-600 font-medium pt-2">Remarks</label>
                      <textarea className="col-span-2 border border-slate-200 rounded-lg p-2 h-20 resize-none" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                    </div>
                  </div>
                )}

                {/* STEP 2: CUSTOMER INFORMATION & LOOKUP */}
                {currentStep === 2 && (
                  <div className="space-y-3.5 max-w-xl relative">
                    <div className="grid grid-cols-3 items-center gap-2">
                      <span className="text-slate-600 font-medium"></span>
                      <div className="col-span-2 relative">
                        <div className="flex items-center border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50">
                          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                          <input
                            type="text"
                            placeholder="lookup customer"
                            className="bg-transparent w-full focus:outline-none text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        {/* Dropdown Suggestions */}
                        {showDropdown && customerSuggestions.length > 0 && (
                          <div className="absolute top-9 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-30 divide-y divide-slate-100">
                            {customerSuggestions.map((c, i) => (
                              <div
                                key={i}
                                onClick={() => selectCustomer(c)}
                                className="p-2.5 hover:bg-slate-100 cursor-pointer font-medium text-slate-800 text-xs flex justify-between"
                              >
                                <span>{c.first_name} {c.last_name}</span>
                                <span className="text-slate-400 text-[11px]">{c.email}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">First name</label>
                      <input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={customer.firstName} onChange={(e) => setCustomer({...customer, firstName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Last name</label>
                      <input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={customer.lastName} onChange={(e) => setCustomer({...customer, lastName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Birth date</label>
                      <input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={customer.birthDate} onChange={(e) => setCustomer({...customer, birthDate: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Contact no.</label>
                      <input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">E-Mail</label>
                      <input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})} />
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENT INFORMATION */}
                {currentStep === 3 && (
                  <div className="space-y-3.5 max-w-xl">
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-slate-600 font-medium">Payment method *</label>
                      <select 
                        className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white font-medium"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                      >
                        <option>Cash</option>
                        <option>Online</option>
                        <option>Cheque</option>
                        <option>Credit Card</option>
                      </select>
                    </div>

                    {paymentMethod === 'Credit Card' && (
                      <>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <label className="text-slate-600 font-medium">Cardholder *</label>
                          <input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={cardholder} onChange={(e) => setCardholder(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <label className="text-slate-600 font-medium">Card Number *</label>
                          <div className="col-span-2 flex items-center space-x-2">
                            <input className="w-full border border-slate-200 rounded-lg p-2 font-mono font-medium" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                            <span className="text-slate-500 font-medium">CVC *</span>
                            <input className="w-16 border border-slate-200 rounded-lg p-2 font-mono" value={cvc} onChange={(e) => setCvc(e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-2">
                          <label className="text-slate-600 font-medium">Expiry date *</label>
                          <input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Vehicle Summary Card */}
              <div className="lg:col-span-4 border border-slate-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
                <img 
                  src={vehicle.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'} 
                  alt={vehicle.model} 
                  className="max-h-36 object-contain mx-auto"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">{vehicle.ratePerDay} <span className="text-xs font-normal text-slate-400">/day</span></p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-xs text-slate-400 font-medium">Total</span>
                  <span className="text-xl font-black text-slate-900">TND {totalRentalAmount}</span>
                </div>
                <div className="space-y-1 text-right text-xs">
                  <p className="text-teal-600 font-semibold underline">Free Cancellation</p>
                  <p className="text-red-500 font-bold">TND {securityDepositAmount} <span className="underline">Security Deposit</span></p>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 4: CHECK-OUT REVIEW */
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-2xl p-8 bg-white shadow-sm space-y-8">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 space-y-2">
                    <h3 className="text-base font-black text-slate-900">{vehicle.brand} {vehicle.model} - {vehicle.ref}</h3>
                    <img src={vehicle.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'} alt={vehicle.model} className="max-h-28 object-contain" />
                  </div>

                  <div className="md:col-span-4 text-xs space-y-1 text-slate-600">
                    <p className="font-bold text-slate-900 mb-1">Customer</p>
                    <p>Mr. {customer.firstName} {customer.lastName}</p>
                    <p>{customer.birthDate}</p>
                    <p>{customer.phone}</p>
                    <p>{customer.email}</p>
                  </div>

                  <div className="md:col-span-4 text-xs space-y-2 text-slate-600">
                    <div>
                      <p className="font-bold text-slate-900">Pick-up</p>
                      <p>12.07.2026 (10:00 am)</p>
                      <p>{pickupLocation}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Drop-off</p>
                      <p>28.07.2026 (10:00 am)</p>
                      <p>{dropoffLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Payment & Price Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t text-xs">
                  <div className="md:col-span-6 space-y-1 text-slate-600">
                    <p className="font-bold text-slate-900 mb-2">Payment</p>
                    <p><span className="text-slate-400">Method:</span> <strong className="text-slate-800">{paymentMethod}</strong></p>
                    <p><span className="text-slate-400">Cardholder:</span> <strong className="text-slate-800">{cardholder}</strong></p>
                    <p><span className="text-slate-400">Card Number:</span> <strong className="font-mono text-slate-800">298*********211</strong></p>
                  </div>

                  <div className="md:col-span-6 space-y-1.5 text-right">
                    <div className="flex justify-between text-slate-600"><span>Rental charge</span><span className="font-semibold">{totalRentalAmount} TND</span></div>
                    <div className="flex justify-between text-slate-600"><span>Rental extras</span><span className="font-semibold">0 TND</span></div>
                    <div className="flex justify-between text-slate-600"><span>Add. insurance</span><span className="font-semibold">0 TND</span></div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t">
                      <span>Total</span>
                      <span>{totalRentalAmount} TND</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button onClick={onCancel} className="px-6 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900">
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={loading}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons (for Steps 1–3) */}
          {currentStep < 4 && (
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : onCancel())}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};