import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface Project {
  name: string;
  client?: string;
  start?: string;
  end?: string;
}

interface ProjectListProps {
  projects: Project[];
  onDelete: (idx: number) => void;
  onDuplicate: (idx: number) => void;
  onTimeChange: (idx: number, field: 'start' | 'end', value: string) => void;
  hours: string[];
  selectedProjectIdx: number;
  onSelectProject: (idx: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onDelete,
  onDuplicate,
  onTimeChange,
  hours,
  selectedProjectIdx,
  onSelectProject,
}) => {
  return (
    <div className="space-y-2">
      {projects.map((proj, idx) => (
        <div
          key={proj.name + idx}
          className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4 p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-lg transition-colors"
        >
          {/* Sélecteur de projet */}
          <input
            type="radio"
            checked={selectedProjectIdx === idx}
            onChange={() => onSelectProject(idx)}
            className="accent-blue-500 w-4 h-4 mr-2"
            title="Sélectionner ce projet pour le timer"
          />
          {/* Nom du projet */}
          <div className="flex-1 min-w-[120px]">
            <span className="text-sm font-semibold text-gray-900">{proj.name}</span>
            {proj.client && <span className="ml-2 text-xs text-gray-500">({proj.client})</span>}
          </div>
          {/* Horaires de travail */}
          <div className="flex items-center gap-1">
            <Select value={proj.start || ''} onValueChange={v => onTimeChange(idx, 'start', v)}>
              <SelectTrigger className="w-20 bg-white border border-gray-300">
                <SelectValue placeholder="Début" />
              </SelectTrigger>
              <SelectContent>
                {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="mx-1 text-gray-500">-</span>
            <Select value={proj.end || ''} onValueChange={v => onTimeChange(idx, 'end', v)}>
              <SelectTrigger className="w-20 bg-white border border-gray-300">
                <SelectValue placeholder="Fin" />
              </SelectTrigger>
              <SelectContent>
                {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDuplicate(idx)}
              title="Dupliquer"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(idx)}
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList; 