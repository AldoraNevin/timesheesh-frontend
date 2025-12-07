import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { ArrowUpRight } from 'lucide-react';

interface ProjectCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, client: string, start: string, end: string) => void;
  hours: string[];
  name: string;
  setName: (v: string) => void;
  client: string;
  setClient: (v: string) => void;
  start: string;
  setStart: (v: string) => void;
  end: string;
  setEnd: (v: string) => void;
  onUpgrade?: () => void;
}

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  open, onOpenChange, onCreate, hours,
  name, setName, client, setClient, start, setStart, end, setEnd, onUpgrade
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du projet <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom du projet"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client <span className="text-gray-400">(facultatif)</span></label>
            <input
              type="text"
              value={client}
              onChange={e => setClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom du client (optionnel)"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Heure de début</label>
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
              <label className="block text-sm font-medium mb-1">Heure de fin</label>
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
          <Button onClick={() => onCreate(name, client, start, end)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">Créer le projet</Button>
          <div className="flex items-center justify-center mt-2">
            <span className="text-xs text-gray-500 mr-2">Besoin de plus de fonctionnalités&nbsp;?</span>
            <Button variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-500 hover:bg-blue-50 px-2 py-1 text-xs font-semibold" onClick={onUpgrade}>
              Upgrade plan <ArrowUpRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateModal; 