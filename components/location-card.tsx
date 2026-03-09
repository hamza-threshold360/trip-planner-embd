'use client';

import { theme } from '@/lib/theme';

interface LocationCardProps {
  image: string;
  title: string;
  category: string;
  categoryColor: 'orange' | 'blue' | 'green';
  address: string;
  number?: number;
  bookings: { label: string; color: 'green' | 'blue' | 'orange' }[];
}

export function LocationCard({ title, category, categoryColor, address, number, bookings }: LocationCardProps) {
  const categoryColorMap = {
    orange: 'bg-orange-50 text-orange-500',
    blue: 'bg-blue-50 text-blue-500',
    green: 'bg-green-50 text-green-600',
  };
  const bookingColorMap = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-500',
    orange: 'bg-orange-50 text-orange-500',
  };

  return (
    <div className="border border-gray-200 bg-white w-full h-full flex flex-col overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
      <div className="relative overflow-hidden flex items-center justify-center" style={{ height: '100px', backgroundColor: '#e8f0f7' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {number !== undefined && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ backgroundColor: theme.accent}}>
            {String(number).padStart(2, '0')}
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
          <span className={`px-2 py-0.5 text-xs font-medium whitespace-nowrap ${categoryColorMap[categoryColor]}`} style={{ borderRadius: theme.borderRadius.pill }}>
            {category}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{address}</p>
        <div className="flex gap-1.5 flex-wrap">
          {bookings.map((booking, idx) => (
            <button key={idx} className={`px-2 py-0.5 text-xs font-medium ${bookingColorMap[booking.color]} hover:opacity-80 transition-opacity`} style={{ borderRadius: theme.borderRadius.pill }}>
              {booking.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
