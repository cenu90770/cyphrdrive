import React from 'react';
import { 
  ArrowLeft, Settings2, Zap, Fuel, Calendar, Gauge, 
  Users, Briefcase, Info, ChevronUp 
} from 'lucide-react';
import { FleetVehicle } from '../data/fleetData';

interface DetailsProps {
  vehicle: FleetVehicle;
  onBack: () => void;
}

export const VehicleDetailsView: React.FC<DetailsProps> = ({ vehicle, onBack }) => {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Fleet Overview
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Car Photo & License Plate */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6">
            <img 
              src={vehicle.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'} 
              alt={vehicle.model} 
              className="max-h-48 object-contain"
            />

            {/* Realistic Tunisian License Plate Graphic matching page 19 */}
            <div className="border-2 border-slate-300 rounded-lg bg-black px-4 py-1.5 shadow-md flex items-center justify-center">
              <span className="text-white font-mono text-xl font-bold tracking-widest">
                256 <span className="font-sans text-base mx-1 text-slate-200">تونس</span> 8331
              </span>
            </div>
          </div>

          {/* Right: Details & Specs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Price Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Ref. {vehicle.ref}</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500 text-white mb-1.5">
                  available
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {vehicle.ratePerDay}<span className="text-xs font-normal text-slate-400">/day</span>
                </span>
                <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                  Standard pack <Info className="w-3 h-3 ml-1 text-slate-400" />
                </span>
              </div>
            </div>

            {/* Technical Specifications Grid (8 icons matching page 19) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 py-4 border-y border-slate-100 text-xs text-slate-700">
              <div className="flex items-center space-x-2.5">
                <Settings2 className="w-4 h-4 text-slate-400" />
                <span>{vehicle.transmission}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Zap className="w-4 h-4 text-slate-400" />
                <span>82 kW (111 hp)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Fuel className="w-4 h-4 text-slate-400" />
                <span>{vehicle.fuel}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{vehicle.firstReg}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Gauge className="w-4 h-4 text-slate-400" />
                <span>{vehicle.mileage}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>5 seats</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>1x large bag</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>1x small bag</span>
              </div>
            </div>

            {/* Collapsible Info Cards: Leasing & Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Leasing Card */}
              <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-xs text-slate-900">Leasing Information</h3>
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-400">Leasing provider</span><span className="font-semibold text-slate-800">Tunisie Leasing SA</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Contract Ref.</span><a href="#" className="font-semibold text-blue-600 underline">LS8776A</a></div>
                  <div className="flex justify-between"><span className="text-slate-400">Leasing type</span><span className="font-semibold text-slate-800">Full amortisation</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Leasing start</span><span className="font-semibold text-slate-800">04.03.2026</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Leasing end</span><span className="font-semibold text-slate-800">04.03.2029</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Leasing amount</span><span className="font-semibold text-slate-800">86.800,00 TND</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Down payment</span><span className="font-semibold text-slate-800">17.360,00 TND (20%)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Monthly charge</span><span className="font-semibold text-slate-800">1.928,88 TND</span></div>
                </div>
              </div>

              {/* Insurance Card */}
              <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-xs text-slate-900">Insurance Information</h3>
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-400">Insurance provider</span><span className="font-semibold text-slate-800">Tunisie Assurance SA</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Contract Ref.</span><a href="#" className="font-semibold text-blue-600 underline">TAL5680776</a></div>
                  <div className="flex justify-between"><span className="text-slate-400">Insurance type</span><span className="font-semibold text-slate-800">Liability coverage</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Insurance start</span><span className="font-semibold text-slate-800">04.03.2026</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Insurance end</span><span className="font-semibold text-slate-800">-</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Damage coverage</span><span className="font-semibold text-slate-800">10.000.000 TND</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Monthly charge</span><span className="font-semibold text-slate-800">928,00 TND</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};