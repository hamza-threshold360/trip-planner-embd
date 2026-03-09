'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { LocationCard } from './location-card';
import { theme } from '@/lib/theme';

interface FilterCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const filters: FilterCategory[] = [
  {
    id: 'bar', label: 'Bar',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22V12M16 22V12M3 12h18M3 6l3-4h12l3 4H3zM5 12v-2h14v2" /></svg>,
  },
  {
    id: 'food', label: 'Food and Dining',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" /></svg>,
  },
  {
    id: 'lodging', label: 'Lodging',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20v-8a2 2 0 012-2h16a2 2 0 012 2v8M2 20h20M2 10V6a2 2 0 012-2h4M12 10V4M20 10V6a2 2 0 00-2-2h-4" /></svg>,
  },
  {
    id: 'cafe', label: 'Cafe',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>,
  },
  {
    id: 'hotels', label: 'Hotels',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8a1 1 0 011-1h16a1 1 0 011 1v14M2 22h20M6 11h4M14 11h4M6 15h4M14 15h4M10 22v-5h4v5" /></svg>,
  },
];

const locations = [
  { id: 1, image: '/placeholder.jpg', title: 'San Frances', category: 'Food Bar', categoryColor: 'orange' as const, address: '4817 West Laurel Street', number: 1, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 2, image: '/placeholder.jpg', title: 'La Terraza', category: 'Cafe', categoryColor: 'blue' as const, address: '120 North Armenia Ave', number: 2, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 3, image: '/placeholder.jpg', title: 'Harbor View', category: 'Hotels', categoryColor: 'green' as const, address: '880 Channelside Drive', number: 3, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 4, image: '/placeholder.jpg', title: 'The Rooftop', category: 'Bar', categoryColor: 'orange' as const, address: '601 S Harbour Island Blvd', number: 4, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
  { id: 5, image: '/placeholder.jpg', title: 'Bella Italia', category: 'Food Bar', categoryColor: 'orange' as const, address: '2224 W Morrison Ave', number: 5, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 6, image: '/placeholder.jpg', title: 'Sunrise Lodge', category: 'Lodging', categoryColor: 'blue' as const, address: '3300 W Cypress St', number: 6, bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 7, image: '/placeholder.jpg', title: 'Blue Agave', category: 'Bar', categoryColor: 'orange' as const, address: '1120 E Kennedy Blvd', number: 7, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
  { id: 8, image: '/placeholder.jpg', title: 'The Grand Inn', category: 'Hotels', categoryColor: 'green' as const, address: '515 N Florida Ave', number: 8, bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 9, image: '/placeholder.jpg', title: 'Cafe Brio', category: 'Cafe', categoryColor: 'blue' as const, address: '208 S Howard Ave', number: 9, bookings: [{ label: 'Bookme.pk', color: 'green' as const }] },
  { id: 10, image: '/placeholder.jpg', title: 'Seaside Grill', category: 'Food Bar', categoryColor: 'orange' as const, address: '1600 N Tampa St', number: 10, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 11, image: '/placeholder.jpg', title: 'Palms Retreat', category: 'Lodging', categoryColor: 'blue' as const, address: '4200 W Kennedy Blvd', number: 11, bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 12, image: '/placeholder.jpg', title: 'The Cellar', category: 'Bar', categoryColor: 'orange' as const, address: '777 N Ashley Dr', number: 12, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
  { id: 13, image: '/placeholder.jpg', title: 'Verde Kitchen', category: 'Food Bar', categoryColor: 'orange' as const, address: '316 N Hyde Park Ave', number: 13, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 14, image: '/placeholder.jpg', title: 'Morning Cup', category: 'Cafe', categoryColor: 'blue' as const, address: '2910 W Bay to Bay Blvd', number: 14, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
  { id: 15, image: '/placeholder.jpg', title: 'Bay Tower Hotel', category: 'Hotels', categoryColor: 'green' as const, address: '100 S Ashley Dr', number: 15, bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 16, image: '/placeholder.jpg', title: 'The Loft Bar', category: 'Bar', categoryColor: 'orange' as const, address: '1800 N 15th St', number: 16, bookings: [{ label: 'Bookme.pk', color: 'green' as const }] },
  { id: 17, image: '/placeholder.jpg', title: 'Olive & Vine', category: 'Food Bar', categoryColor: 'orange' as const, address: '3802 Henderson Blvd', number: 17, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 18, image: '/placeholder.jpg', title: 'Riverwalk Inn', category: 'Lodging', categoryColor: 'blue' as const, address: '600 N Ashley Dr', number: 18, bookings: [{ label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
  { id: 19, image: '/placeholder.jpg', title: 'Brew & Bean', category: 'Cafe', categoryColor: 'blue' as const, address: '1410 N Dale Mabry Hwy', number: 19, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }] },
  { id: 20, image: '/placeholder.jpg', title: 'Skyline Suites', category: 'Hotels', categoryColor: 'green' as const, address: '200 E Kennedy Blvd', number: 20, bookings: [{ label: 'Bookme.pk', color: 'green' as const }, { label: 'Booking.com', color: 'blue' as const }, { label: 'Expedia', color: 'orange' as const }] },
];

interface ExploreSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  tripLocations?: { name: string }[];
}

export function ExploreSection({ isOpen, onToggle, tripLocations = [] }: ExploreSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = locations.filter((loc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = loc.title.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q) || loc.category.toLowerCase().includes(q);
    const matchesFilter = !activeFilter ||
      (activeFilter === 'bar' && loc.category.toLowerCase().includes('bar')) ||
      (activeFilter === 'food' && loc.category.toLowerCase().includes('food')) ||
      (activeFilter === 'lodging' && loc.category.toLowerCase() === 'lodging') ||
      (activeFilter === 'cafe' && loc.category.toLowerCase() === 'cafe') ||
      (activeFilter === 'hotels' && loc.category.toLowerCase() === 'hotels');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`bg-white overflow-hidden border border-gray-200 flex flex-col min-h-0 transition-all ${isOpen ? 'flex-1' : 'flex-shrink-0'}`} style={{ borderRadius: theme.borderRadius.md }}>
      <div className="text-white px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: theme.primary }}>
        <h2 className="text-sm font-semibold">Explore</h2>
        <button onClick={onToggle} className="p-1 hover:opacity-80 rounded-md transition-colors" aria-label={isOpen ? 'Collapse' : 'Expand'}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col flex-1 min-h-0 p-3 gap-2">
          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
                style={activeFilter === filter.id
                  ? { borderColor: theme.accent, backgroundColor: theme.accentLight, color: theme.accent, borderRadius: theme.borderRadius.pill }
                  : { borderRadius: theme.borderRadius.pill }}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border transition-all ${activeFilter === filter.id ? '' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
            <div className="relative flex-1 min-w-48">
              <input
                type="text"
                placeholder="Search Destination"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 focus:outline-none text-sm"
                style={{ borderRadius: theme.borderRadius.md }}
                onFocus={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.accentLight}`; }}
                onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="grid gap-3 pb-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {filteredLocations.map((location) => {
                const tripIndex = tripLocations.findIndex(l => l.name === location.title);
                return (
                  <div key={location.id} style={{ height: '260px' }}>
                    <LocationCard {...location} number={tripIndex !== -1 ? tripIndex + 1 : undefined} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
