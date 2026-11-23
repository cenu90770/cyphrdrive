import React, { useState } from 'react';
import { 
  Check, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronUp, 
  Info, 
  Settings2, 
  Zap, 
  Fuel, 
  Calendar, 
  Gauge, 
  Users, 
  Briefcase 
} from 'lucide-react';
import { apiRequest } from '../lib/api';

interface OnboardingProps {
  adminToken: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const VehicleOnboardingWizard: React.FC<OnboardingProps> = ({ adminToken, onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Technical Data
    type: 'Car',
    brand: 'Kia',
    model: 'Picanto',
    transmission: 'Manual gearbox',
    fuel: 'Petrol',
    power: '63 kW (86 hp)',
    cylinders: '4',
    firstReg: '01.01.2024',
    mileage: '274',
    vehicleRef: 'KP002',
    registrationPlate: '256 تونس 8331',
    regCertUploaded: true,

    // Step 2: Vehicle Features
    doorCount: '4/5',
    seats: 5,
    climatisation: 'Automatic Air Conditioning',
    airbags: 'Front Airbags',
    colour: 'White',
    interior: 'Cloth, Other',
    bags: '1x Large, 1x Small',
    features: ['ABS', 'Ambient lighting', 'Central locking', 'Isofix', 'Bluetooth', 'CD player'],
    featuresDocUploaded: true,

    // Step 3: Leasing Information
    leasingProvider: 'Tunisie Leasing SA',
    leasingContractRef: 'LS8436B',
    leasingStart: '15.04.2026',
    leasingEnd: '15.04.2029',
    leasingType: 'Full amortisation',
    leasingAmount: '86.800,00 TND',
    downPayment: '17.360,00 TND (20%)',
    monthlyCharge: '1.928,88 TND',
    leasingDocUploaded: true,

    // Step 4: Insurance Information
    insuranceProvider: 'Tunisie Assurance SA',
    insuranceContractRef: 'TAF923715',
    insuranceStart: '14.04.2026',
    insuranceEnd: '-',
    insuranceType: 'Liability coverage',
    damageCoverage: '10.000.000 TND',
    insuranceMonthlyCharge: '928,00 TND',
    insuranceDocUploaded: true,

    // Step 5: Rental Information
    rentalCharge: '89,99',
    rentalPackage: 'Standard Pack',
    securityDeposit: '2.000 TND',
    damageExcess: '4.000 TND',
    rentalMileage: 'unlimited',
    contractTemplateUploaded: true,
  });

  const steps = [
    '1. Technical data',
    '2. Vehicule features',
    '3. Leasing information',
    '4. Insurance information',
    '5. Rental information',
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const handleFinalSave = async () => {
    setLoading(true);
    try {
      await apiRequest(
        '/admin/fleet/vehicles',
        {
          method: 'POST',
          body: JSON.stringify({
            brand: formData.brand,
            model: formData.model,
            year: 2024,
            category: 'Compact',
            transmission: formData.transmission.includes('Auto') ? 'AUTOMATIC' : 'MANUAL',
            fuelType: formData.fuel.includes('Diesel') ? 'DIESEL' : formData.fuel.includes('Elec') ? 'ELECTRIC' : 'GASOLINE',
            ratePerDay: parseFloat(formData.rentalCharge.replace(',', '.')),
            licensePlate: formData.registrationPlate,
            photos: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80'],
            specs: {
              seats: formData.seats,
              power: formData.power,
              mileage: formData.mileage,
              vehicleRef: formData.vehicleRef,
              firstReg: formData.firstReg,
              climatisation: formData.climatisation,
              airbags: formData.airbags,
              colour: formData.colour,
              interior: formData.interior,
              bags: formData.bags,
              features: formData.features,
              leasing: {
                provider: formData.leasingProvider,
                contractRef: formData.leasingContractRef,
                start: formData.leasingStart,
                end: formData.leasingEnd,
                type: formData.leasingType,
                amount: formData.leasingAmount,
                downPayment: formData.downPayment,
                monthlyCharge: formData.monthlyCharge,
              },
              insurance: {
                provider: formData.insuranceProvider,
                contractRef: formData.insuranceContractRef,
                start: formData.insuranceStart,
                end: formData.insuranceEnd,
                type: formData.insuranceType,
                damageCoverage: formData.damageCoverage,
                monthlyCharge: formData.insuranceMonthlyCharge,
              },
            },
          }),
        },
        adminToken
      );

      setIsCompleted(true);
    } catch (err: any) {
      alert(`Onboarding failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumb */}
      <div className="flex items-center text-xs font-semibold text-slate-400">
        <span className="hover:text-slate-600 cursor-pointer" onClick={onCancel}>Fleet</span>
        <span className="mx-2">&gt;</span>
        <span className="text-slate-900 font-bold">New Item</span>
      </div>

      {/* 2. SUCCESS SCREEN (Pages 8 & 9) */}
      {isCompleted ? (
        <div className="space-y-6">
          {/* Top Success Notification Banner */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Item <span className="font-extrabold text-slate-950">{formData.vehicleRef}</span> has been successfully added to your pool!
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                A notification E-Mail has been sent to <span className="font-semibold text-slate-900">bcarmanager@car-rental.com</span>
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-bold">
              <button 
                onClick={() => { setIsCompleted(false); setCurrentStep(1); }} 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Add another item
              </button>
              <button 
                onClick={onSuccess} 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Go to pool
              </button>
            </div>
          </div>

          {/* Vehicle Detail Card Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6">
                <img 
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80" 
                  alt={formData.model} 
                  className="max-h-48 object-contain"
                />
                <div className="border-2 border-slate-300 rounded-lg bg-black px-4 py-1.5 shadow-md flex items-center justify-center">
                  <span className="text-white font-mono text-xl font-bold tracking-widest">
                    256 <span className="font-sans text-base mx-1 text-slate-200">تونس</span> 8331
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">{formData.brand} {formData.model}</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Ref. {formData.vehicleRef}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500 text-white mb-1.5">available</span>
                    <span className="text-2xl font-black text-slate-900">
                      {formData.rentalCharge} TND <span className="text-xs font-normal text-slate-400">/day</span>
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                      Standard pack <Info className="w-3 h-3 ml-1 text-slate-400" />
                    </span>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 py-4 border-y border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center space-x-2.5"><Settings2 className="w-4 h-4 text-slate-400" /><span>{formData.transmission}</span></div>
                  <div className="flex items-center space-x-2.5"><Zap className="w-4 h-4 text-slate-400" /><span>{formData.power}</span></div>
                  <div className="flex items-center space-x-2.5"><Fuel className="w-4 h-4 text-slate-400" /><span>{formData.fuel}</span></div>
                  <div className="flex items-center space-x-2.5"><Calendar className="w-4 h-4 text-slate-400" /><span>04.2026</span></div>
                  <div className="flex items-center space-x-2.5"><Gauge className="w-4 h-4 text-slate-400" /><span>{formData.mileage} km</span></div>
                  <div className="flex items-center space-x-2.5"><Users className="w-4 h-4 text-slate-400" /><span>{formData.seats} seats</span></div>
                  <div className="flex items-center space-x-2.5"><Briefcase className="w-4 h-4 text-slate-400" /><span>1x large bag</span></div>
                  <div className="flex items-center space-x-2.5"><Briefcase className="w-4 h-4 text-slate-400" /><span>1x small bag</span></div>
                </div>

                {/* Leasing & Insurance Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center font-bold text-xs pb-1 border-b text-slate-900">
                      <span>Leasing Information</span><ChevronUp className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex justify-between"><span className="text-slate-400">Leasing provider</span><span className="font-semibold text-slate-800">{formData.leasingProvider}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Contract Ref.</span><span className="font-semibold text-blue-600 underline">{formData.leasingContractRef}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Leasing start</span><span className="font-semibold text-slate-800">{formData.leasingStart}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Leasing end</span><span className="font-semibold text-slate-800">{formData.leasingEnd}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Leasing type</span><span className="font-semibold text-slate-800">{formData.leasingType}</span></div>
                  </div>

                  <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center font-bold text-xs pb-1 border-b text-slate-900">
                      <span>Insurance Information</span><ChevronUp className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex justify-between"><span className="text-slate-400">Insurance provider</span><span className="font-semibold text-slate-800">{formData.insuranceProvider}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Contract Ref.</span><span className="font-semibold text-blue-600 underline">{formData.insuranceContractRef}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Insurance start</span><span className="font-semibold text-slate-800">{formData.insuranceStart}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Insurance end</span><span className="font-semibold text-slate-800">{formData.insuranceEnd}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Insurance type</span><span className="font-semibold text-slate-800">{formData.insuranceType}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. WIZARD CONTAINER (Pages 2–7) */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
          {/* Top 5-Step Stepper Tabs */}
          <div className="border-b border-slate-200 flex space-x-8 text-xs font-semibold">
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

          {/* Form Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Car Photo Preview */}
            <div className="lg:col-span-3 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px]">
              <img
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80"
                alt="Car Preview"
                className="max-h-36 object-contain"
              />
            </div>

            {/* Middle: Step Form Fields */}
            <div className="lg:col-span-6 space-y-3 text-xs">
              
              {/* STEP 1: TECHNICAL DATA */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Type</label>
                    <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-medium" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option>Car</option>
                      <option>SUV</option>
                      <option>Van</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Brand</label>
                    <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-medium" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})}>
                      <option>Kia</option>
                      <option>Suzuki</option>
                      <option>Audi</option>
                      <option>BMW</option>
                      <option>Volkswagen</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Model</label>
                    <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-medium" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})}>
                      <option>Picanto</option>
                      <option>Baleno</option>
                      <option>i4</option>
                      <option>Q5</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Transmission</label>
                    <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-medium" value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})}>
                      <option>Manual gearbox</option>
                      <option>Automatic</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Fuel</label>
                    <select className="col-span-2 border border-slate-200 rounded-lg p-2 bg-white text-slate-800 font-medium" value={formData.fuel} onChange={(e) => setFormData({...formData, fuel: e.target.value})}>
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>Electric</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Power</label>
                    <input className="col-span-2 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium" value={formData.power} onChange={(e) => setFormData({...formData, power: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Cylinders</label>
                    <input className="col-span-2 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium" value={formData.cylinders} onChange={(e) => setFormData({...formData, cylinders: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">First registration</label>
                    <input className="col-span-2 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium" value={formData.firstReg} onChange={(e) => setFormData({...formData, firstReg: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Mileage</label>
                    <div className="col-span-2 flex items-center">
                      <input className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 font-medium mr-2" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} />
                      <span className="font-bold text-slate-400">km</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Vehicule Ref.</label>
                    <input className="col-span-2 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium font-mono" value={formData.vehicleRef} onChange={(e) => setFormData({...formData, vehicleRef: e.target.value})} />
                  </div>

                  {/* Tunisian Registration Plate Input (Page 4) */}
                  <div className="grid grid-cols-3 items-center gap-2 pt-1">
                    <label className="text-slate-600 font-medium">Registration plate</label>
                    <input className="col-span-2 border border-slate-200 rounded-lg p-2 text-slate-800 font-bold font-mono" value={formData.registrationPlate} onChange={(e) => setFormData({...formData, registrationPlate: e.target.value})} />
                  </div>
                </div>
              )}

              {/* STEP 2: VEHICLE FEATURES */}
              {currentStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 items-center gap-2"><span className="text-slate-500 font-medium">Door count</span><span className="col-span-2 font-bold text-slate-900">{formData.doorCount}</span></div>
                  <div className="grid grid-cols-3 items-center gap-2"><span className="text-slate-500 font-medium">Number of seats</span><span className="col-span-2 font-bold text-slate-900">{formData.seats}</span></div>
                  <div className="grid grid-cols-3 items-center gap-2"><span className="text-slate-500 font-medium">Climatisation</span><span className="col-span-2 font-bold text-slate-900">{formData.climatisation}</span></div>
                  <div className="grid grid-cols-3 items-center gap-2"><span className="text-slate-500 font-medium">Airbags</span><span className="col-span-2 font-bold text-slate-900">{formData.airbags}</span></div>
                  <div className="grid grid-cols-3 items-center gap-2"><span className="text-slate-500 font-medium">Colour</span><span className="col-span-2 font-bold text-slate-900">{formData.colour}</span></div>
                  <div className="grid grid-cols-3 items-center gap-2"><span className="text-slate-500 font-medium">Interior</span><span className="col-span-2 font-bold text-slate-900">{formData.interior}</span></div>
                  <div className="grid grid-cols-3 items-center gap-2"><span className="text-slate-500 font-medium">Bags</span><span className="col-span-2 font-bold text-slate-900">{formData.bags}</span></div>

                  <div className="pt-2">
                    <span className="text-slate-500 font-medium block mb-2">Other features</span>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.features.map((feat) => (
                        <div key={feat} className="flex items-center text-[11px] font-semibold text-slate-800">
                          {feat} <Check className="w-3.5 h-3.5 ml-1 text-teal-600 stroke-[3]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LEASING INFORMATION */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Leasing provider</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.leasingProvider} onChange={(e) => setFormData({...formData, leasingProvider: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Contract Ref.</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium text-blue-600 underline" value={formData.leasingContractRef} onChange={(e) => setFormData({...formData, leasingContractRef: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Leasing start</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.leasingStart} onChange={(e) => setFormData({...formData, leasingStart: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Leasing end</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.leasingEnd} onChange={(e) => setFormData({...formData, leasingEnd: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Leasing type</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.leasingType} onChange={(e) => setFormData({...formData, leasingType: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Leasing amount</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.leasingAmount} onChange={(e) => setFormData({...formData, leasingAmount: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Down payment</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.downPayment} onChange={(e) => setFormData({...formData, downPayment: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Monthly charge</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.monthlyCharge} onChange={(e) => setFormData({...formData, monthlyCharge: e.target.value})} /></div>
                </div>
              )}

              {/* STEP 4: INSURANCE INFORMATION */}
              {currentStep === 4 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Insurance provider</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.insuranceProvider} onChange={(e) => setFormData({...formData, insuranceProvider: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Contract Ref.</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium text-blue-600 underline" value={formData.insuranceContractRef} onChange={(e) => setFormData({...formData, insuranceContractRef: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Insurance start</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.insuranceStart} onChange={(e) => setFormData({...formData, insuranceStart: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Insurance end</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.insuranceEnd} onChange={(e) => setFormData({...formData, insuranceEnd: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Insurance type</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.insuranceType} onChange={(e) => setFormData({...formData, insuranceType: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Damage coverage</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.damageCoverage} onChange={(e) => setFormData({...formData, damageCoverage: e.target.value})} /></div>
                  <div className="grid grid-cols-3 items-center gap-2"><label className="text-slate-600 font-medium">Monthly charge</label><input className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium" value={formData.insuranceMonthlyCharge} onChange={(e) => setFormData({...formData, insuranceMonthlyCharge: e.target.value})} /></div>
                </div>
              )}

              {/* STEP 5: RENTAL INFORMATION */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Rental charge *</label>
                    <div className="col-span-2 flex items-center">
                      <input className="w-full border border-slate-200 rounded-lg p-2 font-bold text-slate-900 mr-2" value={formData.rentalCharge} onChange={(e) => setFormData({...formData, rentalCharge: e.target.value})} />
                      <span className="font-bold text-slate-700">TND</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-slate-600 font-medium">Rental package</label>
                    <select className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium bg-white" value={formData.rentalPackage} onChange={(e) => setFormData({...formData, rentalPackage: e.target.value})}>
                      <option>Standard Pack</option>
                      <option>Premium Pack</option>
                    </select>
                  </div>

                  {/* Expanded Package Specifications (Page 7) */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Security deposit</span><span className="font-bold text-slate-900">{formData.securityDeposit}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Damage excess</span><span className="font-bold text-slate-900">{formData.damageExcess}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Mileage</span><span className="font-bold text-slate-900">{formData.rentalMileage}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Document Upload Zone (Pages 2, 5, 6, 7) */}
            <div className="lg:col-span-3">
              {currentStep === 5 && formData.contractTemplateUploaded ? (
                /* PDF Template Uploaded Preview (Page 7) */
                <div className="border-2 border-teal-500 rounded-2xl p-4 relative bg-white shadow-sm flex flex-col items-center">
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="w-full border border-slate-200 rounded p-2 bg-slate-50 text-[9px] text-slate-400 font-mono space-y-1 my-2">
                    <p className="font-bold text-slate-600">CONTRAT DE LOCATION N° [ContractRef]</p>
                    <div className="grid grid-cols-2 gap-1 border-y py-1">
                      <span>LOCATAIRE: [Client]</span>
                      <span>VEHICULE: [Model]</span>
                    </div>
                    <p className="pt-1">DEPART / RETOUR INSPECTION CHECKLIST</p>
                  </div>
                </div>
              ) : (
                /* Standard Upload Dashed Box */
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-4 bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-400">
                    {currentStep === 1 && 'Vehicule Registration Certificate*'}
                    {currentStep === 2 && 'Vehicule Features Document'}
                    {currentStep === 3 && 'Leasing Contract Policy'}
                    {currentStep === 4 && 'Insurance Policy Document'}
                    {currentStep === 5 && 'Rental Contract Template'}
                  </p>
                  <label className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer block underline">
                    select file
                    <input type="file" className="hidden" />
                  </label>
                  <button className="w-full py-2 bg-blue-400 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-sm">
                    upload
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <button
              onClick={handleBack}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : currentStep === 5 ? 'Save' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};