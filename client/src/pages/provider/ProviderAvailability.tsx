import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { providersApi } from '../../services/api';
import { ProviderAvailability } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const ProviderAvailabilityPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ProviderAvailability[]>([
    { id: 'av-0', providerId: 'prov-1', dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isAvailable: false },
    { id: 'av-1', providerId: 'prov-1', dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { id: 'av-2', providerId: 'prov-1', dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { id: 'av-3', providerId: 'prov-1', dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { id: 'av-4', providerId: 'prov-1', dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { id: 'av-5', providerId: 'prov-1', dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isAvailable: true },
    { id: 'av-6', providerId: 'prov-1', dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isAvailable: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const provs = await providersApi.getProviders();
        if (provs && provs[0]?.availabilities && provs[0].availabilities.length > 0) {
          setSchedules(provs[0].availabilities);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAvailabilities();
  }, []);

  const handleToggleDay = (dayIndex: number) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayIndex ? { ...s, isAvailable: !s.isAvailable } : s))
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await providersApi.updateAvailability(schedules);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Weekly Operating Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Specify which days of the week and operating hours you accept customer repair dispatches
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Weekly Schedule'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your weekly operating hours have been updated across the Fixora marketplace!</span>
        </div>
      )}

      {/* Days Schedule Card List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        {DAYS.map((dayName, index) => {
          const schedule = schedules.find((s) => s.dayOfWeek === index) || {
            dayOfWeek: index,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: index !== 0,
            providerId: 'prov-1',
            id: `av-${index}`
          };

          return (
            <div
              key={dayName}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                schedule.isAvailable
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-60'
              }`}
            >
              {/* Day Name & Toggle */}
              <div className="flex items-center space-x-4 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => handleToggleDay(index)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    schedule.isAvailable ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      schedule.isAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dayName}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {schedule.isAvailable ? 'Working Day' : 'Day Off'}
                  </span>
                </div>
              </div>

              {/* Working Hours Input */}
              {schedule.isAvailable ? (
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 font-medium">Start:</span>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <span className="text-slate-400 font-bold">to</span>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-medium">End:</span>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Not accepting customer dispatches on this day
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
