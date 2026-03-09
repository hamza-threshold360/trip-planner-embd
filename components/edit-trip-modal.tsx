'use client';

import { useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { theme } from '@/lib/theme';
import { TripData } from './create-trip-modal';

interface EditTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: TripData;
  onSave: (updated: TripData) => void;
}

export function EditTripModal({ open, onOpenChange, trip, onSave }: EditTripModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [tripName, setTripName] = useState(trip.name);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [manualDays, setManualDays] = useState<number | ''>(trip.activeTab === 'days' ? trip.tripDays : '');
  const [nameError, setNameError] = useState(false);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (val: boolean) => {
    if (val) {
      // Reset to current trip values when opening
      setTripName(trip.name);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setManualDays(trip.activeTab === 'days' ? trip.tripDays : '');
      setNameError(false);
    }
    onOpenChange(val);
  };

  const formatDisplay = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const dateDiffDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  const handleUpdate = () => {
    if (!tripName.trim()) { setNameError(true); return; }
    const tripDays = trip.activeTab === 'dates' ? dateDiffDays() : (manualDays || 1) as number;
    onSave({ ...trip, name: tripName.trim(), startDate, endDate, tripDays });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden bg-white border-0"
        style={{ maxWidth: '480px', width: '90vw', borderRadius: '16px' }}
      >
        <div className="p-8">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Edit Trip</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Start creating a new trip by adding start and end date with selecting multiple options
            </p>
          </div>

          <div className="space-y-5">
            {/* Trip Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800">Trip Name</label>
              <input
                value={tripName}
                onChange={e => { setTripName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
                placeholder="Vacations"
                className="w-full px-4 py-3 border text-sm focus:outline-none text-gray-700"
                style={{
                  borderColor: nameError ? '#ef4444' : '#e5e7eb',
                  borderRadius: theme.borderRadius.md,
                  boxShadow: nameError ? '0 0 0 3px #fee2e2' : '',
                }}
                onFocus={e => { if (!nameError) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accentLight}`; } }}
                onBlur={e => { if (!nameError) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = ''; } }}
              />
              {nameError && <p className="text-xs text-red-500 px-2">Trip name is required</p>}
            </div>

            {/* Start Date — only if dates mode */}
            {trip.activeTab === 'dates' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800">Start Date</label>
                  <div
                    className="relative flex items-center border border-gray-200 overflow-hidden cursor-pointer"
                    style={{ borderRadius: theme.borderRadius.md }}
                    onClick={() => startRef.current?.showPicker?.()}
                  >
                    <span className="flex-1 px-4 py-3 text-sm text-gray-700 select-none">{formatDisplay(startDate)}</span>
                    <span className="pr-4 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </span>
                    <input
                      ref={startRef}
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={e => { const val = e.target.value; setStartDate(val); if (endDate && endDate < val) setEndDate(val); }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800">End Date</label>
                  <div
                    className="relative flex items-center border border-gray-200 overflow-hidden cursor-pointer"
                    style={{ borderRadius: theme.borderRadius.md }}
                    onClick={() => endRef.current?.showPicker?.()}
                  >
                    <span className="flex-1 px-4 py-3 text-sm text-gray-700 select-none">{formatDisplay(endDate)}</span>
                    <span className="pr-4 text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </span>
                    <input
                      ref={endRef}
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={e => { const val = e.target.value; if (val < startDate) setStartDate(val); setEndDate(val); }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Days — only if days mode */}
            {trip.activeTab === 'days' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800">Number of Days</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={manualDays}
                  onChange={e => setManualDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="e.g. 5"
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none text-gray-700"
                  style={{ borderRadius: theme.borderRadius.md }}
                  onFocus={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accentLight}`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = ''; }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => handleOpenChange(false)}
              className="flex-1 py-3 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ borderRadius: theme.borderRadius.md }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 py-3 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: theme.accent, borderRadius: theme.borderRadius.md }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentHover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
            >
              Update
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
