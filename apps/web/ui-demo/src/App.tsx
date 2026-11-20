import React, { useState, useEffect } from 'react';
import { BookingWizard } from './components/BookingWizard';
import { FleetLiveMap } from './components/FleetLiveMap';
import { Car, ShieldCheck, User } from 'lucide-react';
import { apiRequest } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'renter' | 'admin'>('renter');
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Automatically acquire real signed JWT tokens for both personas
  useEffect(() => {
    async function authenticatePersonas() {
      try {
        // 1. Authenticate Customer
        const customerAuth = await apiRequest<{ accessToken: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'customer.verified@gmail.com',
            password: 'Password123!',
          }),
        });
        setCustomerToken(customerAuth.accessToken);

        // 2. Authenticate Fleet Admin
        const adminAuth = await apiRequest<{ accessToken: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'fleet.admin@cyphrdrive.io',
            password: 'Password123!',
          }),
        });
        setAdminToken(adminAuth.accessToken);
      } catch (err: any) {
        console.error('Auto-login failed:', err);
        setAuthError('Authentication failed: Ensure your backend is running on port 3000.');
      }
    }

    authenticatePersonas();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="text-brand-500 w-7 h-7" />
            <span className="text-xl font-black tracking-tight">CyphrDrive®</span>
          </div>

          {/* Persona Switcher */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('renter')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center ${
                  activeTab === 'renter' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 mr-1" /> Customer View
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center ${
                  activeTab === 'admin' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Fleet Admin Live Map
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        {authError ? (
          <div className="max-w-xl mx-auto p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
            <p className="font-semibold">{authError}</p>
          </div>
        ) : activeTab === 'renter' ? (
          customerToken ? (
            <BookingWizard customerToken={customerToken} />
          ) : (
            <p className="text-center py-10 text-slate-500">Authenticating customer...</p>
          )
        ) : adminToken ? (
          <FleetLiveMap adminToken={adminToken} />
        ) : (
          <p className="text-center py-10 text-slate-500">Authenticating fleet admin...</p>
        )}
      </main>
    </div>
  );
}