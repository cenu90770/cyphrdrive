import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Phone, 
  Mail, 
  MapPin, 
  Lock 
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export const BranchSettingsView: React.FC<{ adminToken: string }> = ({ adminToken }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'hours' | 'surge' | 'security'>('profile');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Settings State
  const [settings, setSettings] = useState({
    id: '',
    name: 'Tunis-Carthage International Airport Hub',
    code: 'TUN-AIRPORT',
    address: 'Avenue de la République, Zone Fret',
    city: 'Tunis',
    country: 'Tunisia',
    phone: '+216 71 100 200',
    email: 'tunis.airport@cyphrdrive.io',
    operatingHours: {
      mon_fri: '08:00 - 20:00',
      sat_sun: '09:00 - 18:00',
      bufferHours: 2,
    },
    surgeRules: {
      autoSurgeEnabled: true,
      thresholdUtilization: 80,
      surgeMultiplier: 1.25,
      peakSeasonStart: '01.06',
      peakSeasonEnd: '31.08',
      seasonalMultiplier: 1.30,
    },
    security: {
      mfaEnabled: true,
      emailAlerts: true,
      smsAlerts: false,
    },
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any>('/admin/settings/branch', {}, adminToken);
      setSettings((prev) => ({
        ...prev,
        ...data,
        operatingHours: { ...prev.operatingHours, ...(data.operatingHours || {}) },
        surgeRules: { ...prev.surgeRules, ...(data.surgeRules || {}) },
        security: { ...prev.security, ...(data.security || {}) },
      }));
    } catch (err) {
      // Retain clean baseline
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await apiRequest(
        '/admin/settings/branch',
        {
          method: 'PUT',
          body: JSON.stringify(settings),
        },
        adminToken
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with Save Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Branch Configuration</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Manage physical location, handover hours, demand surge rates, and administrative security (FR-6.4, FR-6.8)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSettings}
            className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition"
            title="Refresh settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center transition shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center text-xs font-bold text-teal-800 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
          Branch configurations and dynamic surge pricing rules updated successfully.
        </div>
      )}

      {/* 2. Navigation Pills */}
      <div className="flex border-b border-slate-200 space-x-8 text-xs font-semibold">
        {[
          { id: 'profile', label: 'Branch Profile', icon: Building2 },
          { id: 'hours', label: 'Operating Windows', icon: Clock },
          { id: 'surge', label: 'Demand Surge Rates', icon: TrendingUp },
          { id: 'security', label: 'Security & Alerts', icon: ShieldCheck },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`pb-3 flex items-center transition-colors ${
                isActive
                  ? 'border-b-2 border-blue-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-4xl space-y-6 text-xs">
        {/* SECTION 1: BRANCH PROFILE & LOCATION (FR-6.4) */}
        {activeSection === 'profile' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-black text-slate-900 border-b pb-2">Branch Identification & Contact</h2>
            
            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-slate-600 font-medium">Branch Name</label>
              <input
                className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium bg-white text-slate-900"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-slate-600 font-medium">Branch Code</label>
              <input
                className="col-span-2 border border-slate-200 rounded-lg p-2 font-mono font-bold bg-slate-50 text-slate-500 cursor-not-allowed"
                value={settings.code}
                disabled
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-slate-600 font-medium flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> Physical Address
              </label>
              <input
                className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium bg-white text-slate-900"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-slate-600 font-medium flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" /> Direct Hotline
              </label>
              <input
                className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium bg-white text-slate-900"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-slate-600 font-medium flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> Notification Email
              </label>
              <input
                className="col-span-2 border border-slate-200 rounded-lg p-2 font-medium bg-white text-slate-900"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* SECTION 2: OPERATING WINDOWS & BUFFERS (FR-6.4, FR-6.8) */}
        {activeSection === 'hours' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-black text-slate-900 border-b pb-2">Vehicle Handover Schedule</h2>

            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-slate-600 font-medium">Monday – Friday</label>
              <input
                className="col-span-2 border border-slate-200 rounded-lg p-2 font-mono font-medium"
                value={settings.operatingHours.mon_fri}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    operatingHours: { ...settings.operatingHours, mon_fri: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2">
              <label className="text-slate-600 font-medium">Saturday & Sunday</label>
              <input
                className="col-span-2 border border-slate-200 rounded-lg p-2 font-mono font-medium"
                value={settings.operatingHours.sat_sun}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    operatingHours: { ...settings.operatingHours, sat_sun: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-2 pt-2 border-t border-slate-100">
              <label className="text-slate-600 font-medium">Cleaning & Turnaround Buffer</label>
              <div className="col-span-2 flex items-center space-x-2">
                <input
                  type="number"
                  className="w-24 border border-slate-200 rounded-lg p-2 font-bold font-mono"
                  value={settings.operatingHours.bufferHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      operatingHours: { ...settings.operatingHours, bufferHours: Number(e.target.value) },
                    })
                  }
                />
                <span className="text-slate-500 font-medium">hours between back-to-back rentals</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: AUTOMATED DEMAND SURGE PRICING (FR-6.8, FR-9.1) */}
        {activeSection === 'surge' && (
          <div className="space-y-5 max-w-2xl">
            <h2 className="text-sm font-black text-slate-900 border-b pb-2">Dynamic Surge & Seasonal Rules</h2>

            {/* Toggle 1: High Demand Multiplier */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Automated High-Demand Surge</p>
                  <p className="text-[11px] text-slate-400">Apply price multiplier when branch fleet is nearly fully booked</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  checked={settings.surgeRules.autoSurgeEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      surgeRules: { ...settings.surgeRules, autoSurgeEnabled: e.target.checked },
                    })
                  }
                />
              </div>

              {settings.surgeRules.autoSurgeEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="text-slate-500 font-medium block mb-1">Trigger Threshold</label>
                    <div className="flex items-center space-x-1 font-mono font-bold">
                      <span>&gt;</span>
                      <input
                        type="number"
                        className="w-20 border border-slate-300 rounded p-1.5 bg-white"
                        value={settings.surgeRules.thresholdUtilization}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            surgeRules: { ...settings.surgeRules, thresholdUtilization: Number(e.target.value) },
                          })
                        }
                      />
                      <span>% Fleet Booked</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium block mb-1">Surge Multiplier</label>
                    <input
                      type="number"
                      step="0.05"
                      className="w-24 border border-slate-300 rounded p-1.5 font-mono font-bold bg-white"
                      value={settings.surgeRules.surgeMultiplier}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          surgeRules: { ...settings.surgeRules, surgeMultiplier: Number(e.target.value) },
                        })
                      }
                    />
                    <span className="text-[11px] text-slate-400 ml-1.5">e.g. 1.25 = +25%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Seasonal Peak Window */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <p className="font-bold text-slate-900">Summer Peak Season Modifier</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Start Date</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                    value={settings.surgeRules.peakSeasonStart}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        surgeRules: { ...settings.surgeRules, peakSeasonStart: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">End Date</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                    value={settings.surgeRules.peakSeasonEnd}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        surgeRules: { ...settings.surgeRules, peakSeasonEnd: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                    value={settings.surgeRules.seasonalMultiplier}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        surgeRules: { ...settings.surgeRules, seasonalMultiplier: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: SECURITY & NOTIFICATIONS (NFR-2.3) */}
        {activeSection === 'security' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-black text-slate-900 border-b pb-2">Administrative Security & MFA</h2>

            <div className="flex justify-between items-center p-3 border rounded-xl bg-slate-50">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900">Two-Factor Authentication (MFA)</p>
                  <p className="text-[11px] text-slate-400">Require 6-digit OTP confirmation on admin console login</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                Active
              </span>
            </div>

            <div className="flex justify-between items-center p-3 border rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-900">Critical Telematics OBD-II Alerts</p>
                <p className="text-[11px] text-slate-400">Dispatch instant notifications when engine trouble codes (DTCs) occur</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                checked={settings.security.emailAlerts}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, emailAlerts: e.target.checked },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};