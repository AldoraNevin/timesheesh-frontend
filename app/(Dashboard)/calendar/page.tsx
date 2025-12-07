"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalendarGrid from './components/calendar-grid';
import WorkEntryModal from './components/workEntry-modal';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"




// Projets simulés (à remplacer par un fetch si besoin)
const projets = [
  { name: 'Projet Alpha' },
  { name: 'Projet Beta' },
  { name: 'Projet Gamma' },
];

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getWeekDays = (date: Date) => {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      date: d,
      isToday:
        d.toDateString() === new Date().toDateString(),
    };
  });
};

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00',
];

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [entries, setEntries] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date>(new Date());
  const [modalStart, setModalStart] = useState('09:00');
  const [modalEnd, setModalEnd] = useState('17:00');

  const weekDays = getWeekDays(currentWeek);

  const handleCellClick = (date: Date, time: string) => {
    setModalDate(date);
    setModalStart(time);
    setModalEnd(timeSlots[timeSlots.indexOf(time) + 2] || time); // 1h par défaut
    setModalOpen(true);
  };

  const handleSaveEntry = (entry: any) => {
    setEntries([...entries, entry]);
    setModalOpen(false);
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeek);
    prev.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prev);
  };
  const handleNextWeek = () => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 mt-16">
      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 flex-wrap">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
            {/* View Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-2 md:mb-0">
              <button className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-white rounded-md shadow-sm">
                CALENDAR
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  view === 'week'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setView('week')}
              >
                Week
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  view === 'day'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setView('day')}
              >
                Day
              </button>
            </div>
            {/* Add Button (peut ouvrir le modal sur aujourd'hui à 09:00) */}
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => handleCellClick(new Date(), '09:00')}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter une entrée
            </Button>
          </div>
          {/* Zone droite du header */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
            <Button variant="outline" size="sm" className="shrink-0">
              <Settings className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <select className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm">
                <option>Teammates</option>
              </select>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <select className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm">
                <option>This week</option>
              </select>
              <Button variant="outline" size="sm" className="shrink-0" onClick={handlePrevWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="shrink-0" onClick={handleNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Calendar Grid */}
      <CalendarGrid
        entries={entries}
        onCellClick={handleCellClick}
        view={view}
        weekDays={weekDays}
        timeSlots={timeSlots}
      />
      {/* Modal d'ajout d'entrée */}
      <WorkEntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEntry}
        projets={projets}
        initialDate={modalDate}
        initialStart={modalStart}
        initialEnd={modalEnd}
      />
    </div>
  );
}