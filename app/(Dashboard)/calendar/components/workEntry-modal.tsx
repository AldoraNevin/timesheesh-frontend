import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
  projets: { name: string }[];
  initialDate: Date;
  initialStart: string;
  initialEnd: string;
}

const hours = Array.from({length: 33}, (_, i) => {
  const h = Math.floor((6*60 + i*30)/60).toString().padStart(2, '0');
  const m = ((i*30)%60).toString().padStart(2, '0');
  return `${h}:${m}`;
});

const getNextDays = (start: Date, count: number) => {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

const WorkEntryModal: React.FC<WorkEntryModalProps> = ({ open, onClose, onSave, projets, initialDate, initialStart, initialEnd }) => {
  const [date, setDate] = useState<Date>(initialDate);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [projet, setProjet] = useState('');
  const [tags, setTags] = useState('');
  const [billable, setBillable] = useState(false);
  const [daysStart, setDaysStart] = useState(() => {
    const d = new Date(initialDate);
    d.setHours(0,0,0,0);
    return d;
  });
  const nextDays = getNextDays(daysStart, 14);
  const currentMonth = nextDays[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  useEffect(() => {
    setDate(initialDate);
    setStart(initialStart);
    setEnd(initialEnd);
    setProjet('');
    setTags('');
    setBillable(false);
  }, [open, initialDate, initialStart, initialEnd]);

  useEffect(() => {
    if (projet) setBillable(true);
  }, [projet]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une entrée de travail</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                aria-label="Jours précédents"
                onClick={() => setDaysStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 14); return d; })}
                className="p-2 rounded-full hover:bg-blue-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-base capitalize">{currentMonth}</span>
              <button
                type="button"
                aria-label="Jours suivants"
                onClick={() => setDaysStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 14); return d; })}
                className="p-2 rounded-full hover:bg-blue-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex sm:grid sm:grid-cols-7 gap-2 sm:gap-3">
                {nextDays.map((d) => {
                  const isSelected = date.toDateString() === d.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => setDate(d)}
                      className={`flex flex-col items-center justify-center rounded-full px-3 py-2 min-w-[3.2rem] min-h-[3.2rem] transition-all duration-150 border-2 text-xs sm:text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                        ${isSelected ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                    >
                      <span className="font-bold">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                      <span>{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Début</label>
              <Select value={start} onValueChange={setStart}>
                <SelectTrigger className="w-full bg-white border border-gray-300">
                  <SelectValue placeholder="Début" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Fin</label>
              <Select value={end} onValueChange={setEnd}>
                <SelectTrigger className="w-full bg-white border border-gray-300">
                  <SelectValue placeholder="Fin" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Projet</label>
            <Select value={projet} onValueChange={setProjet}>
              <SelectTrigger className="w-full bg-white border border-gray-300">
                <SelectValue placeholder="Projet" />
              </SelectTrigger>
              <SelectContent>
                {projets.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ajouter des tags (séparés par des virgules)" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={billable} onCheckedChange={setBillable} />
            <span className="text-sm">Billable</span>
          </div>
          <DialogFooter>
            <Button onClick={() => onSave({ date, start, end, projet, tags, billable })} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">Ajouter</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkEntryModal; 