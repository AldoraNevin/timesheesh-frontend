"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { projectService } from "@/lib/api"
import type { Project as ApiProject } from "@/lib/api/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronDown, Copy, Save, Download, Menu, Search, Star, ChevronUp, Edit, ChevronLeft, ChevronRight, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"

const COLORS = [
  { name: "green", class: "bg-green-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "red", class: "bg-red-500" },
  { name: "purple", class: "bg-purple-500" },
  { name: "yellow", class: "bg-yellow-400" },
  { name: "orange", class: "bg-orange-500" },
  { name: "pink", class: "bg-pink-400" },
  { name: "teal", class: "bg-teal-500" },
  { name: "gray", class: "bg-gray-500" },
];

function ColorPicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${COLORS.find(c => c.name === value)?.class || "bg-gray-200"} border-gray-300`}
          aria-label="Choose color"
        >
          {value && <Check className="w-4 h-4 text-white" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${color.class} ${value === color.name ? "ring-2 ring-blue-500" : "border-gray-300"}`}
              onClick={() => onChange(color.name)}
              aria-label={color.name}
            >
              {value === color.name && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatWeekRange(date: Date) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
}

type RowType = {
  id: number;
  type: 'project' | 'task';
  name?: string;
  projectName?: string;
  color?: string;
};

export default function TimesheetPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [rows, setRows] = useState<RowType[]>([{ id: 1, type: 'project' }]);
  const [selectedColor, setSelectedColor] = useState("green");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<{ name: string; color: string }[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Ajout d'un utilitaire pour convertir une chaîne en secondes
  function parseTimeInput(input: string): number {
    // Formats acceptés : "1.5" (heures décimales), "2:30" (hh:mm), "1h20m10s"
    if (/^\d+(\.\d+)?$/.test(input)) {
      // Format décimal (heures)
      return Math.round(parseFloat(input) * 3600);
    }
    const regex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
    const match = input.match(regex);
    if (match) {
      const h = parseInt(match[1] || "0", 10);
      const m = parseInt(match[2] || "0", 10);
      const s = parseInt(match[3] || "0", 10);
      return h * 3600 + m * 60 + s;
    }
    if (/^\d+:\d{2}$/.test(input)) {
      const [h, m] = input.split(":").map(Number);
      return h * 3600 + m * 60;
    }
    return 0;
  }

  function formatSeconds(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Ajout d'un nouvel état pour stocker les heures saisies par projet/tâche
  const [rowTimes, setRowTimes] = useState<{ [rowId: number]: { [day: string]: string } }>({});

  // Gestion de la saisie dans les inputs
  const handleTimeInputChange = (rowId: number, day: string, value: string) => {
    setRowTimes(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [day]: value
      }
    }));
  };

  const handleTimeInputKeyDown = (rowId: number, day: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = rowTimes[rowId]?.[day] || "";
      const seconds = parseTimeInput(value);
      setRowTimes(prev => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [day]: formatSeconds(seconds)
        }
      }));
    }
  };

  // Calcul du total pour chaque ligne
  function getRowTotal(rowId: number): string {
    const times = rowTimes[rowId] || {};
    let totalSec = 0;
    weekDays.slice(1, -1).forEach(day => {
      const val = times[day.value] || "";
      totalSec += parseTimeInput(val);
    });
    return formatSeconds(totalSec);
  }

  const weekDays = [
    { label: "Project", value: "project" },
    { label: `Mo ${format(addDays(startOfWeek(currentWeek), 0), 'dd/MM')}`, value: "mon", time: "00:00:00" },
    { label: `Tu ${format(addDays(startOfWeek(currentWeek), 1), 'dd/MM')}`, value: "tue", time: "00:00:00" },
    { label: `We ${format(addDays(startOfWeek(currentWeek), 2), 'dd/MM')}`, value: "wed", time: "00:00:00" },
    { label: `Th ${format(addDays(startOfWeek(currentWeek), 3), 'dd/MM')}`, value: "thu", time: "00:00:00" },
    { label: `Fr ${format(addDays(startOfWeek(currentWeek), 4), 'dd/MM')}`, value: "fri", time: "00:00:00" },
    { label: `Sa ${format(addDays(startOfWeek(currentWeek), 5), 'dd/MM')}`, value: "sat", time: "00:00:00" },
    { label: `Su ${format(addDays(startOfWeek(currentWeek), 6), 'dd/MM')}`, value: "sun", time: "00:00:00" },
    { label: "Total", value: "total", time: "00:00:00" },
  ];

  // Color mapping function - maps project index to color
  const getProjectColor = (index: number): string => {
    const colorNames = ["green", "blue", "red", "purple", "yellow", "orange", "pink", "teal", "gray"];
    return colorNames[index % colorNames.length];
  };

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const fetchedProjects = await projectService.getAllProjects();
        
        // Map API projects to format needed for timesheet
        const mappedProjects = fetchedProjects.map((p: ApiProject, index: number) => ({
          name: p.name || "Untitled Project",
          color: getProjectColor(index),
        }));
        
        setProjects(mappedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddRow = () => {
    setRows([...rows, { id: rows.length + 1, type: 'project' }]);
  };

  const handleRemoveRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleWeekSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentWeek(date);
      setIsCalendarOpen(false);
    }
  };

  const handleProjectSelect = (projectName: string, color: string) => {
    setSelectedProject(projectName);
    // Update the current row with project info
    const updatedRows = rows.map<RowType>(row => 
      row.id === rows.length ? { ...row, name: projectName, color, type: "project" as "project" } : row
    );
    setRows(updatedRows);
    // Add a new empty row
    setRows([...updatedRows, { id: rows.length + 1, type: "project" }]);
  };

  // Ajout d'un projet à la liste
  const handleSelectProject = (project: { name: string; color: string }) => {
    setRows([...rows, { id: rows.length + 1, type: 'project', name: project.name, color: project.color }]);
    setIsDropdownOpen(false);
  };

  const handleCreateTask = (projectName: string) => {
    setSelectedProjectForTask(projectName);
    setIsCreateTaskOpen(true);
    setIsDropdownOpen(false);
  };

  const handleTaskSubmit = () => {
    if (taskName && selectedProjectForTask) {
      const newTaskRow: RowType = {
        id: rows.length + 1,
        type: 'task',
        name: taskName,
        projectName: selectedProjectForTask,
        color: projects.find(p => p.name === selectedProjectForTask)?.color
      };
      setRows([...rows, newTaskRow]);
      setTaskName("");
      setIsCreateTaskOpen(false);
    }
  };

  // Ligne d'exemple représentant une tâche d'un projet
  const exampleTaskRow: RowType = {
    id: 999,
    type: 'task',
    name: 'Tâche exemple',
    projectName: 'Projet Démo',
    color: 'purple'
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Header */}
      <header className="bg-[#e4eaee] px-4 py-3 text-[#999]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#999]">Timesheet</h1>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Teammates
                  <ChevronDown/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem

                >
                  <div className="grid w-full max-w-sm items-center gap">
                    <Label htmlFor="search"><Search/></Label>
                    <Input/>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  disabled
                >
                  Activity Bar
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                >
                  Panel
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePreviousWeek}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-48 justify-center text-left font-normal"
                  >
                    {formatWeekRange(currentWeek)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={currentWeek}
                    onSelect={handleWeekSelect}
                    initialFocus
                    showOutsideDays={false}
                    className="border-0"
                  />
                </PopoverContent>
              </Popover>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNextWeek}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="sm:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Week Navigation */}
        <div className="bg-[#e4eaee] rounded-lg mb-4 overflow-x-auto lg:overflow-x-visible xl:overflow-x-visible">
          <div className="grid grid-cols-10 w-[900px] sm:w-[1100px] md:w-[1300px] lg:w-full min-w-[900px] sm:min-w-[1100px] md:min-w-[1300px] lg:min-w-0">
            <div className="col-span-1 flex items-center justify-center px-3 py-3 w-full min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-0 max-w-xs text-[#999] font-medium text-center text-sm sm:text-base md:text-lg lg:text-lg">
              Projects
            </div>
            {weekDays.slice(1).map((day, index) => (
              <div
                key={day.value}
                className={`col-span-1 flex items-center justify-center px-3 py-3 w-full min-w-0 max-w-xs text-base lg:text-lg ${index === weekDays.length - 2
                    ? "bg-blue-200 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <div className="truncate break-words w-full">{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Selection Row - Responsive */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 block lg:hidden">
          <div className="flex flex-col gap-2 p-4">
            <div className="mb-2">
              {/* Projets et tâches sélectionnés */}
              {rows.filter(row => row.name || row.type === 'task').map((row) => (
                <div key={row.id} className="relative mb-2">
                  <div className="flex items-center w-full min-w-0 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                    <div className={`w-5 h-5 rounded-full mr-2 ${row.color ? `bg-${row.color}-500` : 'bg-gray-200'}`}></div>
                    <span className="text-gray-700 font-medium break-words w-full">
                      {row.type === 'task' ? `${row.projectName}: ${row.name}` : row.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveRow(rows[rows.length - 1].id)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 flex justify-center items-center p-1 rounded hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {/* Bouton pour sélectionner un projet/tâche toujours en bas */}
              <div className="relative mb-2">
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center w-full min-w-0 cursor-pointer border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-500 bg-white mr-2">
                        <Plus className="w-4 h-4 text-blue-500" />
                      </span>
                      <span className="text-blue-600 font-medium hover:underline break-words w-full">Select Project</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0" align="start" sideOffset={5}>
                    <div className="p-4 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search Project or Client" className="pl-10 bg-gray-50 border-gray-200" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3 mt-3">
                        {projects.map((project) => (
                          <div key={project.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div>
                              <span className="text-gray-700">{project.name}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-500 hover:text-blue-600 hover:underline"
                              onClick={() => handleCreateTask(project.name)}
                            >
                              <span className="mr-1">Create Task</span>
                              <Star className="w-4 h-4 hover:bg-amber-300 cursor-pointer duration-100" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-500 hover:text-green-600 hover:underline"
                              onClick={() => handleSelectProject(project)}
                            >
                              <span className="mr-1">Ajouter</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button 
                  onClick={() => handleRemoveRow(rows[rows.length - 1].id)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 flex justify-center items-center p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Accordion type="single" collapsible defaultValue="" className="flex-1">
              <AccordionItem value="days" className="border-0">
                <AccordionTrigger className="px-0 py-2 text-gray-700 font-medium text-base bg-gray-100 rounded-lg">
                  Afficher les jours et heures
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-2 pb-0">
                  <div className="flex flex-col gap-2">
                    {weekDays.slice(1).map((day, index) => (
                      <div key={day.value} className="flex flex-col gap-1">
                        <label className="text-gray-700 text-sm font-medium">{day.label}</label>
                        <input
                          type="text"
                          value={day.time}
                          readOnly
                          className="w-full text-center bg-transparent text-gray-600 text-base cursor-not-allowed border border-gray-200 rounded-lg py-2"
                          title="Select project/task first"
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Version desktop : grid horizontal */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-x-auto hidden lg:block">
          {rows.map((row) => (
            <div className="grid grid-cols-10 w-full min-w-0 relative" key={row.id}>
              <div className="col-span-1 flex items-center px-3 py-3 w-full min-w-0 max-w-xs border-r border-gray-200 cursor-pointer hover:bg-gray-50">
                {row.type === 'project' && !row.name ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center w-full min-w-0">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-500 bg-white mr-2">
                          <Plus className="w-4 h-4 text-blue-500" />
                        </span>
                        <span className="text-blue-600 font-medium hover:underline break-words w-full">Select Project</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0" align="start" sideOffset={5}>
                      <div className="p-4 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input placeholder="Search Project or Client" className="pl-10 bg-gray-50 border-gray-200" />
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Accordion type="single" collapsible defaultValue="projects" className="flex-1">
                            <AccordionItem value="projects" className="border-0">
                              <div className="flex items-center justify-between">
                                <AccordionTrigger className="p-0 hover:underline text-sm text-gray-600 font-medium flex items-center gap-2 flex-shrink-0">
                                  <span>{projects.length} Project{projects.length !== 1 ? 's' : ''}</span>
                                </AccordionTrigger>
                                <button type="button" className="ml-2 p-1 rounded hover:bg-gray-100">
                                  <Edit className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                              <AccordionContent className="p-0">
                                <div className="space-y-3 mt-3">
                                  {projects.map((project) => (
                                    <div key={project.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div>
                                        <span className="text-gray-700">{project.name}</span>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-blue-500 hover:text-blue-600 hover:underline"
                                        onClick={() => handleCreateTask(project.name)}
                                      >
                                        <span className="mr-1">Create Task</span>
                                        <Star className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>

                        <div className="mt-6 pt-4 border-t">
                          <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Create new Project
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-gray-600 font-normal">Create new Project</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Input placeholder="Enter Project name" className="bg-gray-50 border-gray-200" />
                                  </div>
                                  <div>
                                    <Select>
                                      <SelectTrigger className="bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="Select client" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="client1">Client 1</SelectItem>
                                        <SelectItem value="client2">Client 2</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center gap-3">
                                    <ColorPicker value={selectedColor} onChange={setSelectedColor} />
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id="public"
                                        defaultChecked
                                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                      />
                                      <Label htmlFor="public" className="text-blue-500 font-medium">
                                        Public
                                      </Label>
                                    </div>
                                  </div>

                                  <div>
                                    <Select>
                                      <SelectTrigger className="bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="No template" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="template1">Template 1</SelectItem>
                                        <SelectItem value="template2">Template 2</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 pt-4">
                                <Button
                                  variant="ghost"
                                  onClick={() => setIsCreateProjectOpen(false)}
                                  className="text-gray-500"
                                >
                                  Cancel
                                </Button>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6">CREATE</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center w-full min-w-0">
                    <div className={`w-5 h-5 rounded-full mr-2 ${row.color ? `bg-${row.color}-500` : 'bg-gray-200'}`}></div>
                    <span className="text-gray-700 font-medium break-words w-full">
                      {row.type === 'task' ? `${row.projectName}: ${row.name}` : row.name}
                    </span>
                  </div>
                )}
              </div>
              {weekDays.slice(1).map((day, index) => (
                <div
                  key={day.value}
                  className={`col-span-1 flex items-center justify-center px-3 py-3 w-full min-w-0 max-w-xs border-r border-gray-200 last:border-r-0 text-base lg:text-lg ${day.value === "total" ? "bg-gray-50 font-semibold" : ""}`}
                >
                  {day.value !== "total" ? (
                    <input
                      type="text"
                      value={rowTimes[row.id]?.[day.value] || ""}
                      onChange={e => handleTimeInputChange(row.id, day.value, e.target.value)}
                      onKeyDown={e => handleTimeInputKeyDown(row.id, day.value, e)}
                      className={`w-full text-center bg-transparent text-gray-600 text-base lg:text-lg truncate break-words border border-gray-200 rounded-lg py-2 ${row.type === 'project' && !row.name ? 'cursor-not-allowed' : ''}`}
                      placeholder="hh:mm:ss"
                      title="Entrer les heures au format souhaité"
                      readOnly={row.type === 'project' && !row.name}
                    />
                  ) : (
                    <span className="w-full text-center font-semibold">{getRowTotal(row.id)}</span>
                  )}
                </div>
              ))}
              <button 
                onClick={() => handleRemoveRow(row.id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 flex justify-center items-center p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>            
          ))}
          {/* Ligne d'exemple représentant une tâche d'un projet */}
          <div className="grid grid-cols-10 w-full min-w-0 relative">

          </div>
        </div>

        {/* Task Creation Modal */}
        <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskName" className="text-right">
                  Task Name
                </Label>
                <Input
                  id="taskName"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter task name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">
                  Project
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${projects.find(p => p.name === selectedProjectForTask)?.color}-500`}></div>
                    <span>{selectedProjectForTask}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTaskSubmit}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Total Row */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 mb-6 overflow-x-auto lg:overflow-x-visible xl:overflow-x-visible">
          <div className="grid grid-cols-10 w-[900px] sm:w-[1100px] md:w-[1300px] lg:w-full min-w-[900px] sm:min-w-[1100px] md:min-w-[1300px] lg:min-w-0">
            <div className="col-span-1 flex items-center px-3 py-3 w-full min-w-[120px] sm:min-w-[140px] md:min-w-[160px] lg:min-w-0 max-w-xs border-r border-blue-200">
              <span className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg lg:text-lg truncate break-words w-full">Total</span>
            </div>
            {weekDays.slice(1).map((day) => (
              <div
                key={day.value}
                className={`col-span-1 flex items-center justify-center px-3 py-3 w-full min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-0 max-w-xs border-r border-blue-200 last:border-r-0 text-sm sm:text-base md:text-lg lg:text-lg ${
                  day.value === "total" ? "bg-blue-100 font-bold" : ""
                }`}
              >
                <span className="text-gray-700 font-medium truncate break-words w-full">{day.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={handleAddRow}>
            <Plus className="w-4 h-4" />
            Add new row
          </Button>

          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Copy className="w-4 h-4" />
            Copy last week
            <ChevronDown className="w-4 h-4" />
          </Button>

          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Save className="w-4 h-4" />
            Save as template
          </Button>
        </div>
      </main>
    </div>
  )
}