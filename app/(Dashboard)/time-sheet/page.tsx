"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { projectService, taskService, timesheetService, profileService, adminService } from "@/lib/api"
import type { Project as ApiProject, ProjectMember, User, Timesheet } from "@/lib/api/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronDown, Copy, Save, Download, Menu, Search, Star, ChevronUp, Edit, ChevronLeft, ChevronRight, X, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

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
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
}

type RowType = {
  id: number;
  type: 'project' | 'task';
  name?: string;
  projectName?: string;
  color?: string;
  projectId?: number;
  taskId?: number;
};

export default function TimesheetPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [rows, setRows] = useState<RowType[]>([]);
  const [selectedColor, setSelectedColor] = useState("green");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<{ id: number; name: string; client_name: string; color: string }[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'role'>('individual');
  const [assignedRole, setAssignedRole] = useState<string>("");
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [projectTasks, setProjectTasks] = useState<{ [projectName: string]: any[] }>({});
  const [rowTimes, setRowTimes] = useState<{ [rowId: number]: { [day: string]: string } }>({});

  // Use a ref to rows for handleManualSave to avoid closure capture issues
  const rowsRef = useRef<RowType[]>([]);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  const weekDays = [
    { label: "Project", value: "project" },
    { label: `Mo ${format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 0), 'dd/MM')}`, value: "mon" },
    { label: `Tu ${format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 1), 'dd/MM')}`, value: "tue" },
    { label: `We ${format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 2), 'dd/MM')}`, value: "wed" },
    { label: `Th ${format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 3), 'dd/MM')}`, value: "thu" },
    { label: `Fr ${format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 4), 'dd/MM')}`, value: "fri" },
    { label: `Sa ${format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 5), 'dd/MM')}`, value: "sat" },
    { label: `Su ${format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 6), 'dd/MM')}`, value: "sun" },
    { label: "Total", value: "total" },
  ];

  function parseTimeInput(input: string): number {
    const trimmed = input.trim().replace(',', '.');
    if (!trimmed || trimmed === "0" || trimmed === "00:00:00") return 0;

    // Match HH:mm:ss, HH:mm
    const parts = trimmed.split(/[ :.]+/);
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const s = parseInt(parts[2], 10) || 0;
      return h * 3600 + m * 60 + s;
    }

    // Match just numbers - treat as seconds
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }

    // Match formats like 1h 30m 10s
    const hMatch = trimmed.match(/(\d+)h/i);
    const mMatch = trimmed.match(/(\d+)m/i);
    const sMatch = trimmed.match(/(\d+)s/i);
    let total = 0;
    if (hMatch) total += parseInt(hMatch[1], 10) * 3600;
    if (mMatch) total += parseInt(mMatch[1], 10) * 60;
    if (sMatch) total += parseInt(sMatch[1], 10);

    return total;
  }

  function formatSeconds(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const handleTimeInputChange = (rowId: number, day: string, value: string) => {
    setRowTimes(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], [day]: value }
    }));
  };

  const handleManualSave = async (rowId: number, day: string, value: string) => {
    const secs = parseTimeInput(value);
    const row = rowsRef.current.find(r => r.id === rowId);

    if (row && row.projectId) {
      const dayIndexMap: { [key: string]: number } = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
      const dayIdx = dayIndexMap[day];
      const targetDate = format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), dayIdx), 'yyyy-MM-dd');

      try {
        const payload = {
          project_id: row.projectId,
          task_id: row.taskId || null,
          date: targetDate,
          duration_seconds: secs,
          description: ""
        };
        console.log("[Timesheet] Persisting:", payload);
        await timesheetService.createManualLog(payload);
      } catch (err: any) {
        console.error("[Timesheet] Persistence Error:", {
          message: err.message,
          status: err.status,
          errors: err.errors,
          row: row,
          date: targetDate,
          seconds: secs
        });
      }
    } else {
      console.warn("[Timesheet] Cannot persist: row or projectId missing", { rowId, row });
    }
  };

  const handleTimeInputKeyDown = (rowId: number, day: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = rowTimes[rowId]?.[day] || "";
      const secs = parseTimeInput(value);
      setRowTimes(prev => ({
        ...prev,
        [rowId]: { ...prev[rowId], [day]: formatSeconds(secs) }
      }));
      handleManualSave(rowId, day, value);
    }
  };

  const handleTimeInputBlur = (rowId: number, day: string) => {
    const value = rowTimes[rowId]?.[day] || "";
    const secs = parseTimeInput(value);
    setRowTimes(prev => ({
      ...prev,
      [rowId]: { ...prev[rowId], [day]: formatSeconds(secs) }
    }));
    handleManualSave(rowId, day, value);

  };

  function getRowTotal(rowId: number): string {
    const times = rowTimes[rowId] || {};
    let totalSecs = 0;
    weekDays.slice(1, -1).forEach(day => {
      totalSecs += parseTimeInput(times[day.value] || "");
    });
    return formatSeconds(totalSecs);
  }

  const getProjectColor = (index: number): string => {
    const colorNames = ["green", "blue", "red", "purple", "yellow", "orange", "pink", "teal", "gray"];
    return colorNames[index % colorNames.length];
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch profile
        const profile = await profileService.getProfile();
        setUserProfile(profile);

        setIsLoadingProjects(true);
        const fetchedProjects = await projectService.getAllProjects();
        const mappedProjects = fetchedProjects.map((p: ApiProject, index: number) => ({
          id: p.id,
          name: p.name || "Untitled Project",
          client_name: p.client_name || "",
          color: getProjectColor(index),
        }));
        setProjects(mappedProjects);

        // Fetch logs
        const logs = await timesheetService.getMyLogs();

        // Map logs to rows and rowTimes
        const newRowTimes: { [rowId: number]: { [day: string]: string } } = {};
        const newRows: RowType[] = [];
        let nextRowId = 1;

        console.log(`[Timesheet] Fetched ${logs.length} total logs.`);

        const groupedLogs: { [key: string]: { projectId: number, taskId?: number | null, logs: Timesheet[] } } = {};
        logs.forEach((log: Timesheet) => {
          const key = log.task_id ? `p${log.project_id}t${log.task_id}` : `p${log.project_id}`;
          if (!groupedLogs[key]) {
            groupedLogs[key] = { projectId: log.project_id, taskId: log.task_id, logs: [] };
          }
          groupedLogs[key].logs.push(log);
        });

        Object.values(groupedLogs).forEach(group => {
          const rowTimesForThisGroup: { [day: string]: string } = {};
          let groupHasTimeThisWeek = false;

          group.logs.forEach(log => {
            const logDateS = log.clock_in.split('T')[0];
            const weekStartObj = startOfWeek(currentWeek, { weekStartsOn: 1 });
            const daysShort = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

            for (let i = 0; i < 7; i++) {
              const targetDayS = format(addDays(weekStartObj, i), 'yyyy-MM-dd');
              if (logDateS === targetDayS) {
                const dayShort = daysShort[i];
                const currentSeconds = parseTimeInput(rowTimesForThisGroup[dayShort] || "0");
                const logSeconds = log.duration_seconds || (log.duration_minutes * 60) || 0;
                if (logSeconds > 0) {
                  groupHasTimeThisWeek = true;
                  rowTimesForThisGroup[dayShort] = formatSeconds(currentSeconds + logSeconds);
                }
                break;
              }
            }
          });

          if (groupHasTimeThisWeek) {
            const rowId = nextRowId++;
            const projectMapped = mappedProjects.find(p => p.id === group.projectId);

            let displayName = "Untitled Project";
            if (group.taskId) {
              const logWithTask = group.logs.find(l => l.task);
              displayName = `${projectMapped?.name || "Untitled"} - ${logWithTask?.task?.title || "Unnamed Task"}`;
            } else if (projectMapped) {
              displayName = `${projectMapped.name} - ${projectMapped.client_name}`;
            }

            newRows.push({
              id: rowId,
              type: group.taskId ? 'task' : 'project',
              name: displayName,
              projectName: projectMapped?.name,
              color: projectMapped?.color || 'gray',
              projectId: group.projectId,
              taskId: group.taskId || undefined
            });
            newRowTimes[rowId] = rowTimesForThisGroup;
          }
        });

        newRows.push({ id: nextRowId++, type: 'project' });
        setRows(newRows);
        setRowTimes(newRowTimes);
        console.log(`[Timesheet] Grid ready: ${newRows.length} rows.`);

        const tasksMap: { [projectName: string]: any[] } = {};
        for (const project of fetchedProjects) {
          try {
            const tasks = await taskService.getProjectTasks(project.id);
            tasksMap[project.name] = tasks;
          } catch (err) {
            tasksMap[project.name] = [];
          }
        }
        setProjectTasks(tasksMap);
      } catch (err) {
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchInitialData();
  }, [currentWeek]);

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handleAddRow = () => {
    const newId = Math.max(...rows.map(r => r.id), 0) + 1;
    setRows([...rows, { id: newId, type: 'project' }]);
  };
  const handleRemoveRow = async (id: number) => {
    const row = rows.find(r => r.id === id);
    if (row?.projectId) {
      try {
        const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        console.log("[Timesheet] Deleting row logs for week beginning:", weekStart);
        await timesheetService.deleteWeekLogs({
          project_id: row.projectId,
          task_id: row.taskId || null,
          week_start: weekStart
        });
      } catch (err) {
        console.error("[Timesheet] Failed to permanently delete row:", err);
      }
    }
    setRows(prev => prev.filter(row => row.id !== id));
    setRowTimes(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleWeekSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentWeek(date);
      setIsCalendarOpen(false);
    }
  };

  const handleSelectProject = (project: { id: number; name: string; client_name: string; color: string }, currentRowId: number) => {
    setRows(prev => prev.map(row => {
      if (row.id === currentRowId) {
        return {
          ...row,
          name: `${project.name} - ${project.client_name}`,
          color: project.color,
          projectId: project.id,
          type: 'project'
        };
      }
      return row;
    }));
    setIsDropdownOpen(false);
  };

  const handleCreateTaskOpen = async (projectName: string) => {
    setSelectedProjectForTask(projectName);
    setIsCreateTaskOpen(true);
    setIsDropdownOpen(false);

    try {
      setIsLoadingMembers(true);
      const project = projects.find(p => p.name === projectName);
      let allPotentialUsers: User[] = [];

      // 1. Always include the current user
      if (userProfile) {
        allPotentialUsers.push(userProfile);
      }

      // 2. Fetch project members if project found
      if (project) {
        const members = await projectService.getProjectMembers(project.id);
        members.forEach(m => {
          if (!allPotentialUsers.find(u => u.id === m.user.id)) {
            allPotentialUsers.push(m.user);
          }
        });
      }

      // 3. Fallback: If user is admin/PM, maybe they can assign to ANYONE
      if (userProfile?.role === 'admin') {
        const allUsers = await adminService.getAllUsers();
        if (Array.isArray(allUsers)) {
          allUsers.forEach(u => {
            if (!allPotentialUsers.find(pUser => pUser.id === u.id)) {
              allPotentialUsers.push(u);
            }
          });
        }
      }

      // Convert combined users back to a format that fits projectMembers state (wrapped in ProjectMember-like structure or just change state type)
      // Actually let's just use User[] for the selection state to make it simpler
      const mappedAsMembers: ProjectMember[] = allPotentialUsers.map(u => ({
        id: 0, // dummy
        project_id: project?.id || 0,
        user_id: u.id,
        role_in_project: u.role,
        user: u
      }));

      setProjectMembers(mappedAsMembers);
    } catch (err) {
      console.error("Failed to fetch potential members:", err);
      // Fallback to current user if nothing else works
      if (userProfile) {
        setProjectMembers([{
          id: 0,
          project_id: 0,
          user_id: userProfile.id,
          role_in_project: userProfile.role,
          user: userProfile
        }]);
      }
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleTaskSubmit = async () => {
    if (taskName && selectedProjectForTask) {
      try {
        const project = projects.find(p => p.name === selectedProjectForTask);
        if (!project) return;

        const payload: any = {
          project_id: project.id,
          title: taskName,
          description: ""
        };

        if (assignmentMode === 'individual') {
          payload.assigned_to_id = parseInt(assignedTo);
        } else {
          payload.role = assignedRole;
        }

        const createdTask = await taskService.createTask(payload);

        const newId = Math.max(...rows.map(r => r.id), 0) + 1;
        const newTaskRow: RowType = {
          id: newId,
          type: 'task',
          name: taskName,
          projectName: selectedProjectForTask || undefined,
          color: project?.color || 'gray',
          projectId: project?.id,
          taskId: createdTask.id
        };

        // Add current row logic if open via selection, but handleTaskSubmit currently adds new row.
        // Let's keep it consistent: adds new row but clears modal
        setRows([...rows, newTaskRow]);
        setTaskName("");
        setIsCreateTaskOpen(false);

        // Refresh tasks
        const tasks = await taskService.getProjectTasks(project.id);
        setProjectTasks(prev => ({ ...prev, [project.name]: tasks }));
      } catch (error) {
        alert("Failed to create task.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <header className="bg-[#e4eaee] px-4 py-3 text-[#999]">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <h1 className="text-2xl font-semibold text-[#999]">Timesheet</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handlePreviousWeek} className="text-gray-500"><ChevronLeft className="w-4 h-4" /></Button>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-48 justify-center text-left font-normal">{formatWeekRange(currentWeek)}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={currentWeek} onSelect={handleWeekSelect} initialFocus showOutsideDays={false} className="border-0" />
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="sm" onClick={handleNextWeek} className="text-gray-500"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-4">
        {/* Header Grid */}
        <div className="bg-[#e4eaee] rounded-lg mb-4 overflow-x-auto">
          <div className="grid grid-cols-12 w-full min-w-[1200px]">
            <div className="col-span-3 flex items-center px-4 py-3 text-[#999] font-medium border-r border-gray-200">Projects</div>
            {weekDays.slice(1).map((day, idx) => (
              <div key={day.value} className={`${day.value === 'total' ? 'col-span-2' : 'col-span-1'} flex items-center justify-center px-3 py-3 text-base ${idx === weekDays.length - 2 ? "bg-blue-200 font-semibold" : "text-gray-700"}`}>
                {day.label}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Rows */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-x-auto">
          {rows.map((row) => (
            <div className="grid grid-cols-12 w-full min-w-[1200px] border-b last:border-0 relative" key={row.id}>
              <div className="col-span-3 flex items-center px-4 py-3 border-r border-gray-200">
                {!row.name && row.type === 'project' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center w-full cursor-pointer">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-500 bg-white mr-2">
                          <Plus className="w-4 h-4 text-blue-500" />
                        </span>
                        <span className="text-blue-600 font-medium hover:underline">Select Project</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0" align="start">
                      <div className="p-4 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input placeholder="Search Project or Client" className="pl-10 bg-gray-50" />
                        </div>
                      </div>
                      <div className="p-4">
                        <Accordion type="single" collapsible defaultValue="projects">
                          <AccordionItem value="projects" className="border-0">
                            <AccordionTrigger className="p-0 text-sm font-medium text-gray-600">
                              {projects.length} Projects
                            </AccordionTrigger>
                            <AccordionContent className="p-0 mt-2">
                              <div className="space-y-1">
                                {projects.map((project) => (
                                  <Accordion type="single" collapsible key={project.name} className="w-full">
                                    <AccordionItem value={`tasks-${project.name}`} className="border-0">
                                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-3 h-3 rounded-full bg-${project.color}-500`}></div>
                                          <span className="text-gray-700 font-medium cursor-pointer" onClick={() => handleSelectProject(project, row.id)}>{project.name}</span>
                                        </div>
                                        <AccordionTrigger className="p-0 hover:no-underline">
                                          <span className="text-xs text-gray-500 mr-2">{(projectTasks[project.name] || []).length} tasks</span>
                                        </AccordionTrigger>
                                      </div>
                                      <AccordionContent className="p-0 ml-6">
                                        <div className="space-y-1 mt-1">
                                          {(projectTasks[project.name] || []).map((task) => (
                                            <div key={task.id} className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm text-gray-600" onClick={() => {
                                              setRows(prev => prev.map(r => {
                                                if (r.id === row.id) {
                                                  return {
                                                    ...r,
                                                    type: 'task',
                                                    name: `${project.name} - ${task.title}`,
                                                    projectName: project.name,
                                                    color: project.color,
                                                    projectId: project.id,
                                                    taskId: task.id
                                                  };
                                                }
                                                return r;
                                              }));
                                              setIsDropdownOpen(false);
                                            }}>
                                              {task.title}
                                            </div>
                                          ))}
                                          <Button variant="ghost" size="sm" className="w-full justify-start text-blue-500" onClick={() => handleCreateTaskOpen(project.name)}>
                                            <Plus className="w-3 h-3 mr-2" /> Create Task
                                          </Button>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center w-full overflow-hidden">
                    <div className={`w-3 h-3 rounded-full mr-2 shrink-0 ${row.color ? `bg-${row.color}-500` : 'bg-gray-200'}`}></div>
                    <span className="text-gray-700 font-medium truncate">
                      {row.type === 'task' ? `${row.name}` : (row.name || "Unnamed Project")}
                    </span>
                  </div>
                )}
              </div>

              {weekDays.slice(1).map((day) => (
                <div key={day.value} className={`${day.value === 'total' ? 'col-span-2' : 'col-span-1'} flex items-center justify-center px-2 py-3 border-r border-gray-200 last:border-r-0 ${day.value === "total" ? "bg-gray-50" : ""}`}>
                  {day.value !== "total" ? (
                    <input
                      type="text"
                      value={rowTimes[row.id]?.[day.value] || ""}
                      onChange={e => handleTimeInputChange(row.id, day.value, e.target.value)}
                      onKeyDown={e => handleTimeInputKeyDown(row.id, day.value, e)}
                      onBlur={() => handleTimeInputBlur(row.id, day.value)}

                      className="w-full text-center bg-transparent text-gray-600 border border-gray-200 rounded py-1 px-1 text-sm lg:text-base focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="00:00:00"
                    />
                  ) : (
                    <span className="font-semibold text-sm lg:text-base">{getRowTotal(row.id)}</span>
                  )}
                </div>
              ))}

              <button onClick={() => handleRemoveRow(row.id)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleAddRow}><Plus className="w-4 h-4" /> Add new row</Button>
        </div>

        {/* Task Creation Modal */}
        <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskName" className="text-right">Name</Label>
                <Input id="taskName" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right"></Label>
                <div className="col-span-3">
                  <div className="flex bg-gray-100 p-1 rounded-md mb-2">
                    <button
                      className={`flex-1 text-xs py-1.5 rounded-md transition-all ${assignmentMode === 'individual' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                      onClick={() => setAssignmentMode('individual')}
                    >
                      Individual
                    </button>
                    <button
                      className={`flex-1 text-xs py-1.5 rounded-md transition-all ${assignmentMode === 'role' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}
                      onClick={() => setAssignmentMode('role')}
                    >
                      Role
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
                <div className="col-span-3">
                  {assignmentMode === 'individual' ? (
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingMembers ? "Loading members..." : "Select User"} />
                      </SelectTrigger>
                      <SelectContent>
                        {projectMembers.length > 0 ? (
                          projectMembers.map((member) => (
                            <SelectItem key={member.user.id} value={member.user.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-small">{member.user.full_name}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            {isLoadingMembers ? "Loading..." : "No members found"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={assignedRole} onValueChange={setAssignedRole}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="projectmanager">Project Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Project</Label>
                <div className="col-span-3 font-medium">{selectedProjectForTask}</div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>Cancel</Button>
              <Button onClick={handleTaskSubmit}>Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}