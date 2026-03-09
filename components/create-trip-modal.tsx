'use client';

import { useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertCircle, X, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { theme } from '@/lib/theme';

export interface TripLocation {
  id: string;
  name: string;
  image: string;
  day: number;
  category: string;
  categoryColor: 'orange' | 'blue' | 'green';
  address: string;
  bookings: { label: string; color: 'green' | 'blue' | 'orange' }[];
}

export interface TripData {
  name: string;
  startDate: string;
  endDate: string;
  tripDays: number;
  activeTab: 'dates' | 'days';
  locations: TripLocation[];
}

interface CreateTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTripCreated?: (trip: TripData) => void;
}

interface SelectedLocation {
  id: string;
  name: string;
  image: string;
  day: number;
  category: string;
  categoryColor: 'orange' | 'blue' | 'green';
  address: string;
  bookings: { label: string; color: 'green' | 'blue' | 'orange' }[];
}

export function CreateTripModal({ open, onOpenChange, onTripCreated }: CreateTripModalProps) {
  const [activeStep, setActiveStep] = useState('set-details');
  const [tripName, setTripName] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [activeTab, setActiveTab] = useState('dates');
  const [manualDays, setManualDays] = useState<number | ''>('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [nameError, setNameError] = useState(false);
  const [datesError, setDatesError] = useState(false);
  const [step2ViewMode, setStep2ViewMode] = useState<'dates' | 'days'>('dates');
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 'set-details', label: 'Set Details', description: 'Add basic details of Trip' },
    { id: 'add-locations', label: 'Add Locations', description: 'Add multiple places in days' },
    { id: 'review', label: 'Review', description: 'Add basic details of Trip' },
  ];

  const dateDiffDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  const tripDays = activeTab === 'dates' ? dateDiffDays() : (manualDays || 1);

  const formatDisplay = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  const activeStepIndex = steps.findIndex(s => s.id === activeStep);

  // Returns the date label for day index (0-based) when user chose dates in step 1
  const getDayDateLabel = (dayIndex: number) => {
    if (!startDate) return `Day ${String(dayIndex + 1).padStart(2, '0')}`;
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIndex);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(-2);
    return `${d}-${m}-${y}`;
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = theme.accent
    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accentLight}`;
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e5e7eb';
    e.currentTarget.style.boxShadow = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* showCloseButton={false} — we render our own X to control placement */}
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden bg-white border-0"
        style={{ maxWidth: '860px', width: '90vw', maxHeight: '92vh', borderRadius: theme.borderRadius.lg }}
      >
        <div className="flex" style={{ minHeight: '580px' }}>

          {/* ── Left Panel ── */}
          <div className="flex flex-col p-10 border-r border-gray-100" style={{ width: '320px', flexShrink: 0 }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Create New Trip</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-10">
              Start creating a new trip by adding start and end date with selecting multiple options
            </p>

            <div className="flex flex-col">
              {steps.map((step, index) => {
                const isActive = activeStep === step.id;
                const isDone = index < activeStepIndex;
                return (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center" style={{ width: '36px', flexShrink: 0 }}>
                      <button
                        onClick={() => setActiveStep(step.id)}
                        className="rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 flex-shrink-0"
                        style={{
                          width: '36px', height: '36px',
                          ...(isActive || isDone
                            ? {backgroundColor: theme.accent, borderColor: theme.accent, color: 'white' }
                            : { backgroundColor: 'white', borderColor: '#d1d5db', color: '#9ca3af' }),
                        }}
                      >
                        {isDone ? '✓' : index + 1}
                      </button>
                      {index < steps.length - 1 && (
                        <div className="flex-1 my-1" style={{ width: '2px', backgroundColor: '#e5e7eb', minHeight: '44px' }} />
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold text-base leading-tight ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className={`text-sm mt-0.5 ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                      {index < steps.length - 1 && <div style={{ height: '28px' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Header row with close button */}
            <div className="flex justify-end px-6 pt-5 flex-shrink-0">
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                style={{ borderRadius: theme.borderRadius.sm }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-4">

              {/* SET DETAILS */}
              {activeStep === 'set-details' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold" style={{ color: theme.accent}}>Set Details</h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Trip Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={tripName}
                      onChange={(e) => { setTripName(e.target.value); if (e.target.value.trim()) setNameError(false); }}
                      placeholder="Vacations"
                      className="w-full px-4 py-3 border text-sm focus:outline-none"
                      style={{ borderColor: nameError ? '#ef4444' : '#e5e7eb', boxShadow: nameError ? '0 0 0 3px #fee2e2' : '', borderRadius: theme.borderRadius.md }}
                      onFocus={e => { if (!nameError) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accentLight}`; } }}
                      onBlur={e => { if (!nameError) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = ''; } }}
                    />
                    {nameError && <p className="text-xs text-red-500">Trip name is required</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-800">
                        Dates / Days <span className="text-red-500">*</span>
                        <span className="text-xs font-normal text-gray-400 ml-1">(fill one)</span>
                      </label>
                    </div>
                    {/* Dates / Days toggle */}
                    <div className="flex overflow-hidden border border-gray-200 mb-5" style={{ width: '200px', borderRadius: theme.borderRadius.md }}>
                      {['Dates', 'Days'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => { setActiveTab(tab.toLowerCase()); setDatesError(false); }}
                          className="flex-1 py-2.5 text-sm font-semibold transition-all"
                          style={
                            activeTab === tab.toLowerCase()
                              ? {backgroundColor: theme.accent, color: 'white' }
                              : { backgroundColor: 'white', color: '#6b7280' }
                          }
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {activeTab === 'dates' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Start Date */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">Start Date</label>
                            <div
                              className="relative flex items-center border border-gray-200 overflow-hidden cursor-pointer"
                              style={{ borderRadius: theme.borderRadius.md }}
                              onClick={() => startRef.current?.showPicker?.()}
                            >
                              <span className="flex-1 px-4 py-3 text-sm text-gray-700 select-none">{formatDisplay(startDate)}</span>
                              <span className="pr-3 text-gray-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              </span>
                              <input ref={startRef} type="date" value={startDate} min={today} onChange={e => { const val = e.target.value; setStartDate(val); if (endDate && endDate < val) setEndDate(val); setDatesError(false); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" style={{ colorScheme: 'light', accentColor: theme.accent}} />
                            </div>
                          </div>
                          {/* End Date */}
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">End Date</label>
                            <div
                              className="relative flex items-center border border-gray-200 overflow-hidden cursor-pointer"
                              style={{ borderRadius: theme.borderRadius.md }}
                              onClick={() => endRef.current?.showPicker?.()}
                            >
                              <span className="flex-1 px-4 py-3 text-sm text-gray-700 select-none">{formatDisplay(endDate)}</span>
                              <span className="pr-3 text-gray-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              </span>
                              <input ref={endRef} type="date" value={endDate} min={startDate} onChange={e => { const val = e.target.value; if (val < startDate) setStartDate(val); setEndDate(val); setDatesError(false); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" style={{ colorScheme: 'light', accentColor: theme.accent}} />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 p-4 border" style={{ backgroundColor: theme.accentLight, borderColor: theme.accentBorder, borderRadius: theme.borderRadius.md }}>
                          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: theme.accent}} />
                          <p className="text-sm leading-relaxed" style={{ color: theme.primaryDark }}>
                            Our trip is planned for <strong style={{ color: theme.accent}}>{tripDays} days</strong> — you can add multiple destinations and activities to your itinerary.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'days' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-800">Number of Days</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={manualDays}
                            onChange={e => {
                              const val = e.target.value === '' ? '' : parseInt(e.target.value);
                              setManualDays(val as number | '');
                              if (val && (val as number) > 0) setDatesError(false);
                            }}
                            placeholder="e.g. 5"
                            className="w-full px-4 py-3 border text-sm focus:outline-none"
                            style={{ borderColor: datesError ? '#ef4444' : '#e5e7eb', borderRadius: theme.borderRadius.md }}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                          />
                        </div>

                        {datesError && <p className="text-xs text-red-500">Please enter the number of days</p>}
                        {manualDays && (manualDays as number) > 0 && (
                          <div className="flex gap-3 p-4 border" style={{ backgroundColor: theme.accentLight, borderColor: theme.accentBorder, borderRadius: theme.borderRadius.md }}>
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: theme.accent}} />
                            <p className="text-sm leading-relaxed" style={{ color: theme.primaryDark }}>
                              Our trip is planned for <strong style={{ color: theme.accent}}>{manualDays} days</strong> — you can add multiple destinations and activities to your itinerary.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ADD LOCATIONS */}
              {activeStep === 'add-locations' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-semibold" style={{ color: theme.accent}}>Add Locations</h3>

                  {/* Day pills row + optional toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2 flex-wrap flex-1">
                      {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className="px-3 py-2 text-sm font-semibold border transition-all"
                          style={{
                            borderRadius: theme.borderRadius.sm,
                            ...(selectedDay === day
                              ? {backgroundColor: theme.accent, borderColor: theme.accent, color: 'white' }
                              : { backgroundColor: 'white', borderColor: '#d1d5db', color: '#374151' }),
                          }}
                        >
                          {activeTab === 'dates' && step2ViewMode === 'dates'
                            ? getDayDateLabel(day - 1)
                            : `Day ${String(day).padStart(2, '0')}`}
                        </button>
                      ))}
                    </div>
                    {/* Only show toggle if user picked Dates in step 1 */}
                    {activeTab === 'dates' && (
                      <div className="flex overflow-hidden border border-gray-200 flex-shrink-0" style={{ borderRadius: theme.borderRadius.md }}>
                        {(['dates', 'days'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setStep2ViewMode(mode)}
                            className="px-4 py-2 text-sm font-semibold transition-all"
                            style={
                              step2ViewMode === mode
                                ? {backgroundColor: theme.accent, color: 'white' }
                                : { backgroundColor: 'white', color: '#6b7280' }
                            }
                          >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Destination"
                      className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none pr-10"
                      style={{ borderRadius: theme.borderRadius.md }}
                      onFocus={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accentLight}`; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = ''; }}
                    />
                    <svg className="absolute right-3 top-2.5 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>

                  {/* Location cards */}
                  <div className="grid grid-cols-3 gap-3 overflow-y-auto" style={{ maxHeight: '300px' }}>
                    {[
                      { title: 'San Frances', category: 'Food Bar', categoryColor: 'orange' as const, address: '4817 West Laurel Street', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'La Terraza', category: 'Cafe', categoryColor: 'blue' as const, address: '120 North Armenia Ave', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Harbor View', category: 'Hotels', categoryColor: 'green' as const, address: '880 Channelside Drive', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'The Rooftop', category: 'Bar', categoryColor: 'orange' as const, address: '601 S Harbour Island Blvd', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
                      { title: 'Bella Italia', category: 'Food Bar', categoryColor: 'orange' as const, address: '2224 W Morrison Ave', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Sunrise Lodge', category: 'Lodging', categoryColor: 'blue' as const, address: '3300 W Cypress St', bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Blue Agave', category: 'Bar', categoryColor: 'orange' as const, address: '1120 E Kennedy Blvd', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
                      { title: 'The Grand Inn', category: 'Hotels', categoryColor: 'green' as const, address: '515 N Florida Ave', bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Cafe Brio', category: 'Cafe', categoryColor: 'blue' as const, address: '208 S Howard Ave', bookings: [{ label: 'Bookme.pk', color: 'green' as const }] },
                      { title: 'Seaside Grill', category: 'Food Bar', categoryColor: 'orange' as const, address: '1600 N Tampa St', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Palms Retreat', category: 'Lodging', categoryColor: 'blue' as const, address: '4200 W Kennedy Blvd', bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'The Cellar', category: 'Bar', categoryColor: 'orange' as const, address: '777 N Ashley Dr', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
                      { title: 'Verde Kitchen', category: 'Food Bar', categoryColor: 'orange' as const, address: '316 N Hyde Park Ave', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Morning Cup', category: 'Cafe', categoryColor: 'blue' as const, address: '2910 W Bay to Bay Blvd', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
                      { title: 'Bay Tower Hotel', category: 'Hotels', categoryColor: 'green' as const, address: '100 S Ashley Dr', bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'The Loft Bar', category: 'Bar', categoryColor: 'orange' as const, address: '1800 N 15th St', bookings: [{ label: 'Bookme.pk', color: 'green' as const }] },
                      { title: 'Olive & Vine', category: 'Food Bar', categoryColor: 'orange' as const, address: '3802 Henderson Blvd', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Riverwalk Inn', category: 'Lodging', categoryColor: 'blue' as const, address: '600 N Ashley Dr', bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                      { title: 'Brew & Bean', category: 'Cafe', categoryColor: 'blue' as const, address: '1410 N Dale Mabry Hwy', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
                      { title: 'Skyline Suites', category: 'Hotels', categoryColor: 'green' as const, address: '200 E Kennedy Blvd', bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
                    ].filter((loc) => {
                      const addedEntry = selectedLocations.find(l => l.name === loc.title);
                      // Hide locations added to a different day
                      return !addedEntry || addedEntry.day === selectedDay;
                    }).map((loc) => {
                      const globalIndex = selectedLocations.findIndex(l => l.name === loc.title);
                      const isAddedToCurrentDay = globalIndex !== -1 && selectedLocations[globalIndex].day === selectedDay;
                      return (
                        <div key={loc.title} className="border border-gray-200 overflow-hidden hover:shadow-md transition-shadow" style={{ borderRadius: theme.borderRadius.md }}>
                          <div className="relative h-24 flex items-center justify-center" style={{ backgroundColor: '#e8f0f7' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {isAddedToCurrentDay && (
                              <span className="absolute top-2 right-2 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: theme.accent}}>
                                {String(globalIndex + 1).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          <div className="p-2.5">
                            <h4 className="font-semibold text-xs text-gray-900 truncate">{loc.title}</h4>
                            <p className="text-xs text-orange-500 font-medium">{loc.category}</p>
                            <p className="text-xs text-gray-400 truncate mb-1.5">{loc.address}</p>
                            <button
                              onClick={() => {
                                if (isAddedToCurrentDay) {
                                  setSelectedLocations(selectedLocations.filter(l => l.name !== loc.title));
                                } else {
                                  setSelectedLocations([...selectedLocations, { id: `day-${selectedDay}-loc-${loc.title}`, name: loc.title, image: '/placeholder.jpg', day: selectedDay, category: loc.category, categoryColor: loc.categoryColor, address: loc.address, bookings: loc.bookings }]);
                                }
                              }}
                              className="text-xs font-semibold"
                              style={{ color: isAddedToCurrentDay ? '#ef4444' : theme.accent}}
                            >
                              {isAddedToCurrentDay ? '− Remove' : '+ Add'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* REVIEW */}
              {activeStep === 'review' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold" style={{ color: theme.accent}}>Review</h3>
                  <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '360px' }}>
                    {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => {
                      const dayLocations = selectedLocations.filter(loc => loc.day === day);
                      // Compute the actual date for this day
                      const dayDate = (() => {
                        if (activeTab === 'dates' && startDate) {
                          const d = new Date(startDate);
                          d.setDate(d.getDate() + (day - 1));
                          return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                        }
                        return null;
                      })();
                      return (
                        <Collapsible key={day} defaultOpen>
                          <div className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
                            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                              <span className="font-semibold text-sm text-gray-900">
                                Day {String(day).padStart(2, '0')}{dayDate ? `- ${dayDate}` : ''}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#F97316', borderRadius: theme.borderRadius.pill }}>
                                  {dayLocations.length} Stops
                                </span>
                                <ChevronDown size={16} className="text-gray-400" />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              {dayLocations.length > 0 ? (
                                <div className="flex flex-wrap gap-2 px-4 pb-4 pt-2">
                                  {dayLocations.map((location) => (
                                    <div key={location.id} className="flex items-center gap-1.5 border border-gray-200 bg-white pr-1.5" style={{ borderRadius: theme.borderRadius.pill }}>
                                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#e8f0f7' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                      </div>
                                      <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{location.name}</span>
                                      <button
                                        onClick={() => setSelectedLocations(selectedLocations.filter(l => l.id !== location.id))}
                                        className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 flex-shrink-0 ml-0.5"
                                      >
                                        <X size={8} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 px-4 pb-3">No locations added for this day</p>
                              )}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => onOpenChange(false)}
                className="px-7 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ borderRadius: theme.borderRadius.md }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeStep === 'set-details') {
                    let valid = true;
                    if (!tripName.trim()) { setNameError(true); valid = false; }
                    const datesInvalid = activeTab === 'days' && (!manualDays || (manualDays as number) < 1);
                    if (datesInvalid) { setDatesError(true); valid = false; }
                    if (!valid) return;
                    setStep2ViewMode('dates');
                    setActiveStep('add-locations');
                  } else if (activeStep === 'add-locations') {
                    setActiveStep('review');
                  } else {
                    // Create
                    onTripCreated?.({
                      name: tripName,
                      startDate,
                      endDate,
                      tripDays: tripDays as number,
                      activeTab: activeTab as 'dates' | 'days',
                      locations: selectedLocations,
                    });
                    onOpenChange(false);
                  }
                }}
                className="px-10 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: theme.accent, borderRadius: theme.borderRadius.md }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentHover)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
              >
                {activeStep === 'review' ? 'Create' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
