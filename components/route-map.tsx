'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { theme } from '@/lib/theme';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAP_STYLE_STANDARD_V3 = "mapbox://styles/stepinside/clx0eoykm06ne01ql0u3i6k0j";

interface RouteMapProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function RouteMap({ isOpen, onToggle }: RouteMapProps) {
  return (
    <div className={`bg-white overflow-hidden border border-gray-200 flex flex-col transition-all ${isOpen ? 'flex-1 min-h-0' : 'flex-shrink-0'}`} style={{ borderRadius: theme.borderRadius.md }}>
      <div className="text-white px-4 py-2 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: theme.primary }}>
        <h2 className="text-sm font-semibold">Route Map</h2>
        <button onClick={onToggle} className="p-1 hover:opacity-80 rounded-md transition-colors" aria-label={isOpen ? 'Collapse' : 'Expand'}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {isOpen && (
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            initialViewState={{
              longitude: -82.45,
              latitude: 27.95,
              zoom: 11,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE_STANDARD_V3}
          />
        </div>
      )}
    </div>
  );
}
