'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { theme } from '@/lib/theme';
import { TripLocation } from './create-trip-modal';

const allLocations = [
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
];

interface AddDayLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: number;
  dayLabel: string;
  allTripLocations: TripLocation[]; // all scheduled locations across all days
  onSave: (newLocations: TripLocation[]) => void; // returns updated full list
}

export function AddDayLocationModal({ open, onOpenChange, day, dayLabel, allTripLocations, onSave }: AddDayLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localDayLocs, setLocalDayLocs] = useState<TripLocation[]>([]);

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setLocalDayLocs(allTripLocations.filter(l => l.day === day));
    } else {
      setLocalDayLocs([]);
      setSearchQuery('');
    }
    onOpenChange(val);
  };

  // Names already used in OTHER days
  const otherDayNames = new Set(allTripLocations.filter(l => l.day !== day).map(l => l.name));
  const localNames = new Set(localDayLocs.map(l => l.name));

  const visible = allLocations.filter(loc => {
    if (otherDayNames.has(loc.title)) return false;
    const q = searchQuery.toLowerCase();
    return loc.title.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q) || loc.category.toLowerCase().includes(q);
  });

  const toggle = (loc: typeof allLocations[0]) => {
    if (localNames.has(loc.title)) {
      setLocalDayLocs(localDayLocs.filter(l => l.name !== loc.title));
    } else {
      setLocalDayLocs([...localDayLocs, {
        id: `day-${day}-loc-${loc.title}`,
        name: loc.title,
        image: '/placeholder.jpg',
        day,
        category: loc.category,
        categoryColor: loc.categoryColor,
        address: loc.address,
        bookings: loc.bookings,
      }]);
    }
  };

  const handleSave = () => {
    const withoutThisDay = allTripLocations.filter(l => l.day !== day);
    onSave([...withoutThisDay, ...localDayLocs]);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden bg-white border-0"
        style={{ maxWidth: '640px', width: '90vw', maxHeight: '80vh', borderRadius: theme.borderRadius.lg }}
      >
        <div className="flex flex-col" style={{ height: '80vh', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Add Location — {dayLabel}</h2>
            <button
              onClick={() => handleOpenChange(false)}
              className="p-1.5 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              style={{ borderRadius: theme.borderRadius.sm }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 pt-4 pb-3 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Destination"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none pr-10"
                style={{ borderRadius: theme.borderRadius.md }}
                onFocus={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accentLight}`; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = ''; }}
              />
              <svg className="absolute right-3 top-2.5 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>

          {/* Location cards */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            {visible.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No locations found</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {visible.map(loc => {
                  const isSelected = localNames.has(loc.title);
                  const idx = localDayLocs.findIndex(l => l.name === loc.title);
                  return (
                    <div key={loc.title} className="border border-gray-200 overflow-hidden hover:shadow-md transition-shadow" style={{ borderRadius: theme.borderRadius.md }}>
                      <div className="relative h-24 flex items-center justify-center" style={{ backgroundColor: '#e8f0f7' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: theme.accent}}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h4 className="font-semibold text-xs text-gray-900 truncate">{loc.title}</h4>
                        <p className="text-xs text-orange-500 font-medium">{loc.category}</p>
                        <p className="text-xs text-gray-400 truncate mb-1.5">{loc.address}</p>
                        <button
                          onClick={() => toggle(loc)}
                          className="text-xs font-semibold"
                          style={{ color: isSelected ? '#ef4444' : theme.accent}}
                        >
                          {isSelected ? '− Remove' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={() => handleOpenChange(false)}
              className="px-7 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ borderRadius: theme.borderRadius.md }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-10 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: theme.accent, borderRadius: theme.borderRadius.md }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentHover)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
