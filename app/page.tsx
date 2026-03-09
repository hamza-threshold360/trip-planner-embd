'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, Share2, List, LayoutGrid, Pencil, X, CalendarDays, GripVertical } from 'lucide-react';
import { RouteMap } from '@/components/route-map';
import { ExploreSection } from '@/components/explore-section';
import { CreateTripModal, TripData, TripLocation } from '@/components/create-trip-modal';
import { FloatingAIButton } from '@/components/floating-ai-button';
import { UnscheduleModal } from '@/components/unschedule-modal';
import { AddDayLocationModal } from '@/components/add-day-location-modal';
import { EditTripModal } from '@/components/edit-trip-modal';
import { ShareModal } from '@/components/share-modal';
import { theme } from '@/lib/theme';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const bookingColorMap: Record<string, string> = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-500',
  orange: 'bg-orange-50 text-orange-500',
};
const categoryColorMap: Record<string, string> = {
  orange: 'bg-orange-50 text-orange-500',
  blue: 'bg-blue-50 text-blue-500',
  green: 'bg-green-50 text-green-600',
};

function formatShortDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDayDate(startDate: string, dayIndex: number) {
  if (!startDate) return null;
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Droppable zone for empty days
function DroppableDayZone({ day, onAddClick }: { day: number; onAddClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-zone-${day}` });
  return (
    <div
      ref={setNodeRef}
      className="space-y-1.5 px-2 pb-2 pt-1 min-h-[40px]"
      style={{ backgroundColor: isOver ? '#e8f0f7' : undefined, borderRadius: 4, transition: 'background-color 0.15s' }}
    >
      <button
        onClick={onAddClick}
        className="w-full text-xs font-medium py-1.5 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
        style={{ borderRadius: theme.borderRadius.sm }}
      >
        + Add Location
      </button>
    </div>
  );
}

// Draggable location row used in edit mode
function SortableLocationRow({
  loc,
  onRemove,
}: {
  loc: TripLocation;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: loc.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white border border-gray-200 px-2 py-2 rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical size={14} />
      </button>
      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#e8f0f7' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
      </div>
      <span className="text-xs font-medium text-gray-800 truncate flex-1">{loc.name}</span>
      <p className="text-xs text-gray-400 truncate" style={{ maxWidth: '80px' }}>{loc.address}</p>
      <button
        onClick={() => onRemove(loc.id)}
        className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 flex-shrink-0"
      >
        <X size={8} />
      </button>
    </div>
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnscheduleModalOpen, setIsUnscheduleModalOpen] = useState(false);
  const [addDayModalDay, setAddDayModalDay] = useState<number | null>(null);
  const [mapOpen, setMapOpen] = useState(true);
  const [exploreOpen, setExploreOpen] = useState(true);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [editMode, setEditMode] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const totalStops = trip ? trip.locations.filter(l => l.day !== 0).length : 0;

  const handleRemoveLoc = (locId: string) => {
    if (!trip) return;
    setTrip({ ...trip, locations: trip.locations.filter(l => l.id !== locId) });
  };

  const handleUnschedule = handleRemoveLoc;

  // Find which day a location id belongs to (0 = unscheduled)
  const getDayForId = (id: string) => {
    const loc = trip?.locations.find(l => l.id === id);
    return loc !== undefined ? loc.day : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !trip) return;

    const activeDay = getDayForId(active.id as string);
    // over could be a location id or a day-drop-zone id like "day-zone-2"
    let overDay: number | null = null;
    const overIdStr = over.id as string;
    if (overIdStr.startsWith('day-zone-')) {
      overDay = parseInt(overIdStr.replace('day-zone-', ''));
    } else {
      overDay = getDayForId(overIdStr);
    }

    if (activeDay === null || overDay === null || activeDay === overDay) return;

    // Move location to the new day
    setTrip({
      ...trip,
      locations: trip.locations.map(l =>
        l.id === active.id ? { ...l, day: overDay as number } : l
      ),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !trip) return;

    const activeDay = getDayForId(active.id as string);
    const overId = over.id as string;

    if (overId.startsWith('day-zone-')) return; // already handled in dragOver

    const overDay = getDayForId(overId);
    if (activeDay === null || overDay === null || activeDay !== overDay) return;

    // Reorder within same day
    const dayLocs = trip.locations.filter(l => l.day === activeDay);
    const otherLocs = trip.locations.filter(l => l.day !== activeDay);
    const oldIndex = dayLocs.findIndex(l => l.id === active.id);
    const newIndex = dayLocs.findIndex(l => l.id === over.id);
    if (oldIndex === newIndex) return;
    const reordered = arrayMove(dayLocs, oldIndex, newIndex);
    setTrip({ ...trip, locations: [...otherLocs, ...reordered] });
  };

  const activeLoc = trip?.locations.find(l => l.id === activeId);

  const getDayLabel = (day: number) => {
    if (!trip) return `Day ${String(day).padStart(2, '0')}`;
    const dayDate = trip.activeTab === 'dates' ? getDayDate(trip.startDate, day - 1) : null;
    return `Day ${String(day).padStart(2, '0')}${dayDate ? ` - ${dayDate}` : ''}`;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <main className="flex-1 overflow-hidden px-5 py-4">
        <div className="flex gap-4 h-full">

          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
            <RouteMap isOpen={mapOpen} onToggle={() => setMapOpen(!mapOpen)} />
            <ExploreSection isOpen={exploreOpen} onToggle={() => setExploreOpen(!exploreOpen)} tripLocations={trip?.locations ?? []} />
          </div>

          {/* My Trip Sidebar */}
          <aside className="w-80 flex-shrink-0 h-full">
            <div className="h-full flex flex-col overflow-hidden border border-gray-200 bg-white" style={{ borderRadius: theme.borderRadius.md }}>

              {/* Header */}
              <div className="px-4 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: theme.primary, height: '44px' }}>
                <h2 className="text-sm font-semibold text-white">My Trip</h2>
                {trip && !editMode && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className="p-1 rounded transition-colors"
                      style={{ color: viewMode === 'list' ? 'white' : 'rgba(255,255,255,0.6)', backgroundColor: viewMode === 'list' ? 'rgba(255,255,255,0.2)' : 'transparent' }}
                      aria-label="List view"
                    >
                      <List size={16} />
                    </button>
                    <span className="text-white opacity-40 text-xs">|</span>
                    <button
                      onClick={() => setViewMode('card')}
                      className="p-1 rounded transition-colors"
                      style={{ color: viewMode === 'card' ? 'white' : 'rgba(255,255,255,0.6)', backgroundColor: viewMode === 'card' ? 'rgba(255,255,255,0.2)' : 'transparent' }}
                      aria-label="Card view"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <span className="text-white opacity-40 text-xs">|</span>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="p-1 rounded text-white opacity-70 hover:opacity-100 transition-colors"
                      aria-label="Share"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {!trip ? (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
                  <p className="text-gray-600 text-sm text-center leading-relaxed">
                    Your trip hasn&apos;t been planned yet. Explore locations and add them to your itinerary by day.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full text-white font-semibold py-2.5 px-4 transition-colors flex items-center justify-center gap-2 text-sm"
                    style={{ backgroundColor: theme.accent, borderRadius: theme.borderRadius.md }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentHover)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                  >
                    <span className="text-lg leading-none">+</span>
                    <span>Create New Trip</span>
                  </button>
                </div>
              ) : (
                /* Trip content */
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  {/* Trip meta */}
                  <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                    {editMode ? (
                      /* Edit mode meta */
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            value={trip.name}
                            onChange={e => setTrip({ ...trip, name: e.target.value })}
                            className="flex-1 min-w-0 text-sm font-semibold text-gray-900 border px-2 py-1 focus:outline-none"
                            style={{ borderColor: theme.accentBorder, borderRadius: theme.borderRadius.sm }}
                            onFocus={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.accentLight}`; }}
                            onBlur={e => { e.currentTarget.style.borderColor = theme.accentBorder; e.currentTarget.style.boxShadow = ''; }}
                          />
                          <button
                            onClick={() => setEditMode(false)}
                            className="text-xs font-semibold text-white px-3 py-1.5 flex-shrink-0 transition-colors"
                            style={{ backgroundColor: theme.accent, borderRadius: theme.borderRadius.sm }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentHover)}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                          >
                            Save
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditTripModalOpen(true)}
                            className="text-xs font-medium whitespace-nowrap px-2 py-1 border border-dashed transition-colors"
                            style={{ color: theme.accent, borderColor: theme.accentBorder, borderRadius: theme.borderRadius.sm }}
                          >
                            {trip.activeTab === 'dates'
                              ? `${formatShortDate(trip.startDate)} - ${formatShortDate(trip.endDate)}`
                              : `${trip.tripDays} Days`}
                          </button>
                          <span className="text-gray-300 text-xs">|</span>
                          <span className="text-xs text-gray-400">{trip.tripDays} Days | {totalStops} Stops</span>
                        </div>
                      </div>
                    ) : (
                      /* View mode meta */
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm text-gray-900">{trip.name}</h3>
                          <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-1 text-xs font-medium border border-gray-200 px-2 py-1 hover:bg-gray-50 transition-colors"
                            style={{ color: theme.accent, borderRadius: theme.borderRadius.sm }}
                          >
                            <Pencil size={11} />
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarDays size={12} />
                            <span>
                              {trip.activeTab === 'dates'
                                ? `${formatShortDate(trip.startDate)} - ${formatShortDate(trip.endDate)}`
                                : `${trip.tripDays} Days`}
                            </span>
                          </div>
                          <span className="text-gray-400">{trip.tripDays} Days | {totalStops} Stops</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Day collapsibles */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                    {editMode ? (
                      /* ── Edit mode: DnD ── */
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                      >
                        {Array.from({ length: trip.tripDays }, (_, i) => i + 1).map((day) => {
                          const dayLocs = trip.locations.filter(l => l.day === day);
                          return (
                            <Collapsible key={day} defaultOpen>
                              <div className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors">
                                  <span className="font-semibold text-xs text-gray-900">{getDayLabel(day)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#F97316', borderRadius: theme.borderRadius.pill }}>
                                      {dayLocs.length} Stops
                                    </span>
                                    <ChevronDown size={14} className="text-gray-400" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SortableContext
                                    items={dayLocs.map(l => l.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    {dayLocs.length === 0 ? (
                                      <DroppableDayZone day={day} onAddClick={() => setAddDayModalDay(day)} />
                                    ) : (
                                      <div className="space-y-1.5 px-2 pb-2 pt-1 min-h-[40px]">
                                        {dayLocs.map(loc => (
                                          <SortableLocationRow
                                            key={loc.id}
                                            loc={loc}
                                            onRemove={handleRemoveLoc}
                                          />
                                        ))}
                                        <button
                                          onClick={() => setAddDayModalDay(day)}
                                          className="w-full text-xs font-medium py-1.5 border border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors mt-1"
                                          style={{ borderRadius: theme.borderRadius.sm }}
                                        >
                                          + Add Location
                                        </button>
                                      </div>
                                    )}
                                  </SortableContext>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                        })}

                        {/* Unscheduled in edit mode — draggable into days */}
                        {trip.locations.filter(l => l.day === 0).length > 0 && (
                          <Collapsible defaultOpen>
                            <div className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
                              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors">
                                <span className="font-semibold text-xs text-gray-900">Unscheduled</span>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#F97316', borderRadius: theme.borderRadius.pill }}>
                                    {trip.locations.filter(l => l.day === 0).length} Stops
                                  </span>
                                  <ChevronDown size={14} className="text-gray-400" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SortableContext
                                  items={trip.locations.filter(l => l.day === 0).map(l => l.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div id="day-zone-0" className="space-y-1.5 px-2 pb-2 pt-1 min-h-[40px]">
                                    {trip.locations.filter(l => l.day === 0).map(loc => (
                                      <SortableLocationRow key={loc.id} loc={loc} onRemove={handleRemoveLoc} />
                                    ))}
                                  </div>
                                </SortableContext>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        )}

                        {/* Unschedule button in edit mode */}
                        <button
                          onClick={() => setIsUnscheduleModalOpen(true)}
                          className="w-full py-2.5 text-sm font-semibold border-2 border-dashed transition-colors"
                          style={{ color: theme.accent, borderColor: theme.accentBorder, borderRadius: theme.borderRadius.md, backgroundColor: theme.accentLight }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3274A410')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accentLight)}
                        >
                          + Unschedule Location
                        </button>

                        <DragOverlay>
                          {activeLoc && (
                            <div className="flex items-center gap-2 bg-white border border-gray-300 shadow-lg px-2 py-2 rounded-lg opacity-95">
                              <GripVertical size={14} className="text-gray-400" />
                              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#e8f0f7' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                              </div>
                              <span className="text-xs font-medium text-gray-800 truncate">{activeLoc.name}</span>
                            </div>
                          )}
                        </DragOverlay>
                      </DndContext>
                    ) : (
                      /* ── View mode ── */
                      <>
                        {Array.from({ length: trip.tripDays }, (_, i) => i + 1).map((day) => {
                          const dayLocs: TripLocation[] = trip.locations.filter(l => l.day === day);
                          const dayDate = trip.activeTab === 'dates' ? getDayDate(trip.startDate, day - 1) : null;
                          return (
                            <Collapsible key={day} defaultOpen>
                              <div className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
                                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors">
                                  <span className="font-semibold text-xs text-gray-900">
                                    Day {String(day).padStart(2, '0')}{dayDate ? `- ${dayDate}` : ''}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#F97316', borderRadius: theme.borderRadius.pill }}>
                                      {dayLocs.length} Stops
                                    </span>
                                    <ChevronDown size={14} className="text-gray-400" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  {dayLocs.length === 0 ? (
                                    <div className="px-3 pb-3 pt-2">
                                      <button
                                        onClick={() => setAddDayModalDay(day)}
                                        className="w-full text-xs font-medium py-2 border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                                        style={{ borderRadius: theme.borderRadius.sm }}
                                      >
                                        + Add Location
                                      </button>
                                    </div>
                                  ) : viewMode === 'list' ? (
                                    <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1">
                                      {dayLocs.map((loc) => (
                                        <div key={loc.id} className="flex items-center gap-1.5 border border-gray-200 bg-white pr-1.5" style={{ borderRadius: theme.borderRadius.pill }}>
                                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#e8f0f7' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                          </div>
                                          <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{loc.name}</span>
                                          <button
                                            onClick={() => handleUnschedule(loc.id)}
                                            className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 flex-shrink-0 ml-0.5"
                                          >
                                            <X size={8} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="space-y-2 px-3 pb-3 pt-1">
                                      {dayLocs.map((loc) => (
                                        <div key={loc.id} className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
                                          <div className="relative overflow-hidden flex items-center justify-center" style={{ height: '80px', backgroundColor: '#e8f0f7' }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ backgroundColor: theme.accent }}>
                                              {String(day).padStart(2, '0')}
                                            </div>
                                          </div>
                                          <div className="p-2">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                              <span className="text-xs font-semibold text-gray-900 truncate">{loc.name}</span>
                                              <span className={`px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${categoryColorMap[loc.categoryColor]}`} style={{ borderRadius: theme.borderRadius.pill }}>
                                                {loc.category}
                                              </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mb-1">{loc.address}</p>
                                            <div className="flex gap-1 flex-wrap">
                                              {loc.bookings.map((b, idx) => (
                                                <span key={idx} className={`px-1.5 py-0.5 text-xs font-medium ${bookingColorMap[b.color]}`} style={{ borderRadius: theme.borderRadius.pill }}>
                                                  {b.label}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                        })}

                        {/* Unscheduled locations section */}
                        {trip.locations.filter(l => l.day === 0).length > 0 && (
                          <div className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                              <span className="font-semibold text-xs text-gray-700">Unscheduled</span>
                              <span className="px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#F97316', borderRadius: theme.borderRadius.pill }}>
                                {trip.locations.filter(l => l.day === 0).length} Stops
                              </span>
                            </div>
                            {viewMode === 'list' ? (
                              <div className="flex flex-wrap gap-2 px-3 pb-3 pt-2">
                                {trip.locations.filter(l => l.day === 0).map((loc) => (
                                  <div key={loc.id} className="flex items-center gap-1.5 border border-gray-200 bg-white pr-1.5" style={{ borderRadius: theme.borderRadius.pill }}>
                                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#e8f0f7' }}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-800 whitespace-nowrap">{loc.name}</span>
                                    <button
                                      onClick={() => handleRemoveLoc(loc.id)}
                                      className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 flex-shrink-0 ml-0.5"
                                    >
                                      <X size={8} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2 px-3 pb-3 pt-2">
                                {trip.locations.filter(l => l.day === 0).map((loc) => (
                                  <div key={loc.id} className="border border-gray-200 overflow-hidden" style={{ borderRadius: theme.borderRadius.md }}>
                                    <div className="relative overflow-hidden flex items-center justify-center" style={{ height: '80px', backgroundColor: '#e8f0f7' }}>
                                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3274A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                      <button
                                        onClick={() => handleRemoveLoc(loc.id)}
                                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500"
                                      >
                                        <X size={8} />
                                      </button>
                                    </div>
                                    <div className="p-2">
                                      <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <span className="text-xs font-semibold text-gray-900 truncate">{loc.name}</span>
                                        <span className={`px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${categoryColorMap[loc.categoryColor]}`} style={{ borderRadius: theme.borderRadius.pill }}>
                                          {loc.category}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 truncate mb-1">{loc.address}</p>
                                      <div className="flex gap-1 flex-wrap">
                                        {loc.bookings.map((b, idx) => (
                                          <span key={idx} className={`px-1.5 py-0.5 text-xs font-medium ${bookingColorMap[b.color]}`} style={{ borderRadius: theme.borderRadius.pill }}>
                                            {b.label}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Unschedule button */}
                        <button
                          onClick={() => setIsUnscheduleModalOpen(true)}
                          className="w-full py-2.5 text-sm font-semibold border-2 border-dashed transition-colors"
                          style={{ color: theme.accent, borderColor: theme.accentBorder, borderRadius: theme.borderRadius.md, backgroundColor: theme.accentLight }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#3274A410')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accentLight)}
                        >
                          + Unschedule Location
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <CreateTripModal open={isModalOpen} onOpenChange={setIsModalOpen} onTripCreated={(t) => {
        setTrip(t);
        setEditMode(false);
        const id = Math.random().toString(36).slice(2, 9);
        setShareUrl(`https://beta-hq.threshold360.com/microsite/map/${id}`);
      }} />
      {trip && (
        <>
          <EditTripModal
            open={isEditTripModalOpen}
            onOpenChange={setIsEditTripModalOpen}
            trip={trip}
            onSave={(updated) => setTrip(updated)}
          />
          <ShareModal
            open={isShareModalOpen}
            onOpenChange={setIsShareModalOpen}
            shareUrl={shareUrl}
          />
          <UnscheduleModal
            open={isUnscheduleModalOpen}
            onOpenChange={setIsUnscheduleModalOpen}
            scheduledLocations={trip.locations.filter(l => l.day !== 0)}
            unscheduledLocations={trip.locations.filter(l => l.day === 0)}
            onSave={(newUnscheduled) => setTrip({ ...trip, locations: [...trip.locations.filter(l => l.day !== 0), ...newUnscheduled] })}
          />
          {addDayModalDay !== null && (
            <AddDayLocationModal
              open={addDayModalDay !== null}
              onOpenChange={(v) => { if (!v) setAddDayModalDay(null); }}
              day={addDayModalDay}
              dayLabel={getDayLabel(addDayModalDay)}
              allTripLocations={trip.locations}
              onSave={(updated) => setTrip({ ...trip, locations: updated })}
            />
          )}
        </>
      )}
      <FloatingAIButton />
    </div>
  );
}
