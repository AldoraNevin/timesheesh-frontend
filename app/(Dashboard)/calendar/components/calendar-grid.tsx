import React from 'react';

interface Entry {
  date: Date;
  start: string;
  end: string;
  projet: string;
  tags: string;
  billable: boolean;
}

interface CalendarGridProps {
  entries: Entry[];
  onCellClick: (date: Date, time: string) => void;
  view: 'week' | 'day';
  weekDays: { day: string; date: Date; isToday?: boolean }[];
  timeSlots: string[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ entries, onCellClick, view, weekDays, timeSlots }) => {
  // Helper pour savoir si une entrée doit s'afficher dans une case
  const isEntryInCell = (entry: Entry, cellDate: Date, cellTime: string) => {
    const d = entry.date;
    return d.getFullYear() === cellDate.getFullYear() && d.getMonth() === cellDate.getMonth() && d.getDate() === cellDate.getDate() && entry.start === cellTime;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      {/* Week Header */}
      <div className="min-w-[600px] grid grid-cols-8 border-b border-gray-200 text-xs sm:text-sm">
        <div className="p-2 sm:p-4 bg-gray-50"></div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`p-2 sm:p-4 text-center border-l border-gray-200 ${day.isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
          >
            <div className={`font-medium ${day.isToday ? 'text-blue-600' : 'text-gray-900'}`}>{day.day}</div>
            <div className={`${day.isToday ? 'text-blue-500' : 'text-gray-500'}`}>{day.date.toLocaleDateString()}</div>
          </div>
        ))}
      </div>
      {/* Time Grid */}
      <div className="max-h-96 overflow-y-auto min-w-[600px]">
        {timeSlots.map((time, timeIndex) => (
          <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50 text-xs sm:text-sm">
            <div className="p-2 sm:p-3 text-gray-500 bg-gray-50 border-r border-gray-200">{time}</div>
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="p-2 sm:p-3 border-l border-gray-200 min-h-[40px] sm:min-h-[60px] cursor-pointer relative"
                onClick={() => onCellClick(day.date, time)}
              >
                {/* Affichage des entrées de travail */}
                {entries.filter(e => isEntryInCell(e, day.date, time)).map((e, i) => (
                  <div key={i} className="absolute inset-0 bg-blue-500 text-white rounded flex flex-col justify-center items-center text-xs font-semibold shadow-md">
                    <span>{e.projet}</span>
                    <span>{e.start} - {e.end}</span>
                    {e.tags && <span className="text-[10px]">{e.tags}</span>}
                    {e.billable && <span className="text-[10px] font-bold">Billable</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid; 