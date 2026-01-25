"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  DollarSign,
  Play,
  Plus,
  Tag,
  Trash2,
  Copy,
  MoreVertical,
  Calendar as CalendarIcon,
  ChevronDown,
  Square,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Star,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { projectService, timesheetService, taskService, profileService } from "@/lib/api"
import type { Timesheet, Project as ApiProject, User } from "@/lib/api/types"
import { startOfWeek, endOfWeek, addDays, format, subWeeks, addWeeks, parseISO, isToday, isYesterday } from "date-fns"

interface Project {
  id: number
  name: string
  client_name: string
  color: string
  tasks: number
  isFavorite?: boolean
}

interface TimeEntry {
  id: string
  description: string
  project: Project
  taskId?: number | null
  startTime: string
  endTime: string
  duration: string
  date: Date
  raw: Timesheet
}

interface GroupedActivity {
  id: string
  description: string
  project: Project
  taskId?: number | null
  totalSeconds: number
  segments: TimeEntry[]
}

interface Toast {
  id: string
  title: string
  description: string
  type: "success" | "error"
  isExiting?: boolean
}

const CustomToast = ({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        onClose(toast.id)
      }, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 bg-white min-w-[320px] max-w-[400px] transition-all duration-300 ${toast.type === "success" ? "border-l-green-500" : "border-l-red-500"
        } ${isExiting
          ? "animate-out slide-out-to-right-full opacity-0 scale-95"
          : "animate-in slide-in-from-right-full opacity-100 scale-100"
        }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {toast.type === "success" ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-sm ${toast.type === "success" ? "text-green-800" : "text-red-800"}`}>
          {toast.title}
        </h4>
        <p className={`text-sm mt-1 ${toast.type === "success" ? "text-green-700" : "text-red-700"}`}>
          {toast.description}
        </p>
      </div>

      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onClose(toast.id), 300)
        }}
        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-md transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}

const parseTimeInput = (input: string): number => {
  const trimmed = input.trim().replace(',', '.');
  if (!trimmed || trimmed === "0" || trimmed === "00:00:00") return 0;
  const parts = trimmed.split(/[ :.]+/);
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const s = parseInt(parts[2], 10) || 0;
    return h * 3600 + m * 60 + s;
  }
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  return 0;
}

const formatSeconds = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const TimeTrackerPage = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchProject, setSearchProject] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
    end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6))
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const showToast = (title: string, description: string, type: "success" | "error") => {
    const newToast: Toast = {
      id: Date.now().toString(),
      title,
      description,
      type,
    }
    setToasts((prev) => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [description, setDescription] = useState("")
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingDescription, setEditingDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState('blue');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [activeSession, setActiveSession] = useState<Timesheet | null>(null)

  const getProjectColor = (index: number): string => {
    const colorClasses = ["bg-green-500", "bg-blue-500", "bg-red-500", "bg-purple-500", "bg-yellow-400", "bg-orange-500", "bg-pink-400", "bg-teal-500", "bg-gray-500"];
    return colorClasses[index % colorClasses.length];
  };

  const mapBackendLog = (log: Timesheet, allProjects: Project[]): TimeEntry => {
    const project = allProjects.find(p => p.id === log.project_id) || {
      id: log.project_id,
      name: log.project?.name || "Untitled Project",
      client_name: log.project?.client_name || "",
      color: "bg-gray-500",
      tasks: 0
    };

    const startDate = parseISO(log.clock_in);
    const endDate = log.clock_out ? parseISO(log.clock_out) : new Date();

    const fmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    return {
      id: log.id.toString(),
      description: log.description || "",
      project: project,
      taskId: log.task_id,
      startTime: fmt(startDate),
      endTime: log.clock_out ? fmt(endDate) : "Running...",
      duration: formatTime(log.duration_seconds || (log.duration_minutes * 60) || 0),
      date: startDate,
      raw: log
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profile, apiProjects, logs] = await Promise.all([
          profileService.getProfile(),
          projectService.getAllProjects(),
          timesheetService.getMyLogs()
        ]);

        setUserProfile(profile);

        const mappedProjects: Project[] = apiProjects.map((p, idx) => ({
          id: p.id,
          name: p.name || "Untitled",
          client_name: p.client_name || "",
          color: getProjectColor(idx),
          tasks: 0 // Could fetch task counts if needed
        }));
        setProjects(mappedProjects);

        const entries = logs.map(log => mapBackendLog(log, mappedProjects));
        setTimeEntries(entries);

        // Check for active session (log with no clock_out)
        const active = logs.find(log => !log.clock_out);
        if (active) {
          console.log("[Tracker] Active session found:", active);
          setActiveSession(active);
          setIsTimerRunning(true);
          setSelectedProject(mappedProjects.find(p => p.id === active.project_id) || null);
          setDescription(active.description || "");

          // Calculate current elapsed time
          const start = parseISO(active.clock_in);
          const elapsed = Math.floor((new Date().getTime() - start.getTime()) / 1000);
          setCurrentTime(elapsed);
        }

      } catch (err) {
        console.error("[Tracker] Initialization failed:", err);
        showToast("Failed to load data", "Could not connect to the server.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateWeekTotal = () => {
    let totalSeconds = 0
    timeEntries.forEach((entry) => {
      // Assuming duration is now calculated from raw.duration_seconds or similar
      const durationInSeconds = entry.raw.duration_seconds || (entry.raw.duration_minutes * 60) || 0;
      totalSeconds += durationInSeconds;
    })
    return formatTime(totalSeconds)
  }

  const toggleProjectFavorite = (projectId: number) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, isFavorite: !project.isFavorite }
          : project
      )
    )
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchProject.toLowerCase()),
  )

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "eee, MMM d")
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  const groupedEntries = useMemo(() => {
    const dayGroups: { [key: string]: { date: Date; activities: GroupedActivity[]; totalSeconds: number } } = {}

    const query = description.toLowerCase().trim()
    const filteredEntries = timeEntries.filter(entry => {
      if (!query) return true
      return (
        entry.description.toLowerCase().includes(query) ||
        entry.project.name.toLowerCase().includes(query)
      )
    })

    filteredEntries.forEach((entry) => {
      const dateKey = format(entry.date, "yyyy-MM-dd")
      if (!dayGroups[dateKey]) {
        dayGroups[dateKey] = { date: entry.date, activities: [], totalSeconds: 0 }
      }

      // Group by Activity (same project, task, and description)
      const activityId = `${entry.project.id}-${entry.taskId || 'no-task'}-${entry.description}`;
      let activity = dayGroups[dateKey].activities.find(a => a.id === activityId);

      if (!activity) {
        activity = {
          id: activityId,
          description: entry.description,
          project: entry.project,
          taskId: entry.taskId,
          totalSeconds: 0,
          segments: []
        };
        dayGroups[dateKey].activities.push(activity);
      }

      const duration = entry.raw.duration_seconds || (entry.raw.duration_minutes * 60) || 0;
      activity.totalSeconds += duration;
      activity.segments.push(entry);
      dayGroups[dateKey].totalSeconds += duration;
    })

    // Sort segments within each activity by time (newest first)
    Object.values(dayGroups).forEach(dg => {
      dg.activities.forEach(act => {
        act.segments.sort((a, b) => b.date.getTime() - a.date.getTime());
      });
      // Sort activities within day by latest segment date
      dg.activities.sort((a, b) => b.segments[0].date.getTime() - a.segments[0].date.getTime());
    });

    return Object.values(dayGroups).sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [timeEntries, description])

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-US', options)}-${end.toLocaleDateString('en-US', options)}`
  }

  const startTimer = async (project: Project, desc: string, taskId: number | null = null) => {
    try {
      console.log("[Tracker] Starting session:", { projectId: project.id, taskId, desc });
      const newSession = await timesheetService.clockIn({
        project_id: project.id,
        task_id: taskId,
        face_similarity_score: 0.99,
        description: desc || ""
      });
      setActiveSession(newSession);
      setIsTimerRunning(true);
      setCurrentTime(0);
      showToast("Timer started", "Your session is being recorded.", "success");
    } catch (err: any) {
      console.error("[Tracker] Start failed:", err);
      const errorMsg = err.response?.data?.error || "Could not start timer.";
      showToast("Error", errorMsg, "error");
    }
  }

  const stopTimer = async () => {
    try {
      console.log("[Tracker] Stopping session...");
      // Ensure we have a valid session to stop
      if (!activeSession && !isTimerRunning) {
        console.warn("[Tracker] Stop called but no active session found in state.");
        setIsTimerRunning(false);
        return;
      }

      // Backend requirements workaround
      const finalDesc = description.trim() || "-";

      const result = await timesheetService.clockOut({
        description: finalDesc
      });

      console.log("[Tracker] Stop success:", result);

      // Refresh logs
      const logs = await timesheetService.getMyLogs();
      const entries = logs.map(log => mapBackendLog(log, projects));
      setTimeEntries(entries);

      setIsTimerRunning(false);
      setCurrentTime(0);
      setDescription("");
      setSelectedTaskId(null);
      setActiveSession(null);
      showToast("Timer stopped", `Time recorded successfully.`, "success");
    } catch (err: any) {
      console.group("[Tracker] Stop Error Details");
      console.error("Message:", err.message);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
      console.groupEnd();

      const errorMsg = err.response?.data?.error || "Could not stop timer.";
      showToast("Error", errorMsg, "error");
      throw err; // Re-throw for restart flow to handle
    }
  }

  const handleSelectActivity = (activity: GroupedActivity) => {
    setSelectedProject(activity.project);
    setSelectedTaskId(activity.taskId || null);
    setDescription(activity.description);
    showToast("Project selected", `Project for "${activity.description}" selected.`, "success");
  }

  const handleRestartEntry = async (entry: TimeEntry) => {
    try {
      if (isTimerRunning) {
        await stopTimer();
      }

      setSelectedProject(entry.project);
      setSelectedTaskId(entry.taskId || null);
      setDescription(entry.description);

      // Now start the new one
      await startTimer(entry.project, entry.description, entry.taskId || null);
    } catch (err) {
      console.error("[Tracker] Restart sequence failed:", err);
    }
  }

  const handleTimerToggle = async () => {
    if (!isTimerRunning) {
      if (!selectedProject) {
        showToast("Project required", "Click a project in 'This Week' history or use the dropdown.", "error");
        return;
      }
      await startTimer(selectedProject, description, selectedTaskId);
    } else {
      await stopTimer();
    }
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    showToast("Project selected", `Project "${project.name}" selected.`, "success")
  }

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== id))
    showToast("Entry deleted", "The time entry has been deleted.", "error")
  }

  const handleDescriptionEdit = (entryId: string, currentDescription: string) => {
    setEditingEntryId(entryId)
    setEditingDescription(currentDescription === "Add description" ? "" : currentDescription)
  }

  const handleDescriptionSave = async (entryId: string) => {
    const newDescription = editingDescription.trim()
    const targetEntry = timeEntries.find(e => e.id === entryId)

    if (targetEntry) {
      try {
        console.log("[Tracker] Persisting surgical description update for ID:", entryId);
        await timesheetService.updateTimesheet(entryId, {
          description: newDescription
        });

        setTimeEntries((prev) =>
          prev.map((e) => (e.id === entryId ? { ...e, description: newDescription } : e)),
        )
        showToast("Description updated", "The session description has been updated.", "success")
      } catch (err) {
        console.error("[Tracker] Description update failed:", err);
        showToast("Update failed", "Could not save description to server.", "error")
      }
    }

    setEditingEntryId(null)
    setEditingDescription("")
  }

  const handleDescriptionKeyPress = (e: React.KeyboardEvent, entryId: string) => {
    if (e.key === "Enter") {
      handleDescriptionSave(entryId)
    }
    if (e.key === "Escape") {
      setEditingEntryId(null)
      setEditingDescription("")
    }
  }

  const createNewProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Math.floor(Math.random() * 1000000), // Temp local ID
        name: newProjectName.trim(),
        client_name: "No client",
        color: `bg-${selectedColor}-500`,
        tasks: 0
      }
      setProjects(prev => [...prev, newProject])
      setSelectedProject(newProject)
      showToast("Project created", `Project "${newProjectName}" has been created`, "success")
      setIsProjectModalOpen(false)
      setNewProjectName("")
      setSelectedColor('blue') // Remet la couleur par défaut
    }
  }

  const updateEntryDate = (entryId: string, date: Date) => {
    setTimeEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, date }
        : entry
    ))
  }

  const deleteBackendEntry = async (id: string) => {
    try {
      console.log("[Tracker] Persisting individual deletion for ID:", id);
      await timesheetService.deleteTimesheet(id);
      deleteTimeEntry(id);
    } catch (err) {
      console.error("[Tracker] Individual deletion failed:", err);
      showToast("Delete failed", "Could not remove log from server.", "error");
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="lg:hidden mt-15">
        <div className="bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="What are you working on?"
                className="flex-1 border-gray-300 focus:border-blue-500 text-gray-700 placeholder:text-gray-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-blue-500 hover:opacity-80">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-blue-500 text-blue-500">
                      <Plus className="w-3 h-3" />
                    </div>
                    <span className="font-medium">{selectedProject ? selectedProject.name : "Project"}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search Project or Client"
                        className="pl-10 border-gray-300"
                        value={searchProject}
                        onChange={(e) => setSearchProject(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredProjects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                          <span className="text-sm font-medium text-gray-900">{project.name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() => setIsProjectModalOpen(true)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-100 mt-1"
                    >
                      <div className="w-3 h-3 rounded-full border-2 border-dashed border-gray-300"></div>
                      <span className="text-sm text-blue-500 font-medium">Create new Project</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <DollarSign className="w-5 h-5 text-blue-500 border-l-2 border-r-2 border-dashed border-blue-400 px-2" />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-lg text-gray-700">{formatTime(currentTime)}</div>
                <Button
                  onClick={handleTimerToggle}
                  className={`px-4 py-2 text-white ${isTimerRunning ? "bg-red-500" : "bg-blue-500"}`}
                >
                  {isTimerRunning ? "STOP" : "START"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-2">This week</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Week total:</span>
            <span className="text-xl font-bold">{calculateWeekTotal()}</span>
          </div>
        </div>

        <div className="bg-white">
          {groupedEntries.map((dayGroup) => (
            <div key={format(dayGroup.date, "yyyy-MM-dd")}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <span className="font-medium text-gray-700">{getDateLabel(dayGroup.date)}</span>
                <span className="text-lg font-bold">{formatTime(dayGroup.totalSeconds)}</span>
              </div>
              {dayGroup.activities.map((activity) => (
                <div key={activity.id} className="border-b border-gray-100">
                  {/* Activity Header */}
                  <div
                    className="p-4 flex items-center justify-between active:bg-gray-50 transition-colors"
                    onClick={() => toggleGroup(activity.id)}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div
                        className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-blue-50/50 rounded px-1 -ml-1 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectActivity(activity);
                        }}
                      >
                        <div className={`w-2 h-2 rounded-full ${activity.project.color}`}></div>
                        <span className="text-sm font-medium text-blue-600 truncate group-hover:underline">
                          {activity.project.name}{activity.taskId ? ` - ${activity.segments[0].raw.task?.title}` : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800 font-medium truncate">
                        {editingEntryId === activity.segments[0].id ? (
                          <Input
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            onBlur={() => handleDescriptionSave(activity.segments[0].id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDescriptionSave(activity.segments[0].id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 text-sm py-1"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDescriptionEdit(activity.segments[0].id, activity.description);
                            }}
                            className="cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {activity.description || "Add description"}
                          </div>
                        )}
                        {activity.segments.length > 1 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
                            {activity.segments.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-700">{formatTime(activity.totalSeconds)}</div>
                        <div className="text-[10px] text-gray-400 font-medium">Total</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestartEntry(activity.segments[0]);
                        }}
                        className="text-gray-400 hover:text-blue-500 p-1 h-auto"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </Button>
                      <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedGroups.has(activity.id) ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Segments */}
                  {expandedGroups.has(activity.id) && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {activity.segments.map((segment) => (
                        <div key={segment.id} className="py-3 px-4 flex flex-col border-b last:border-0 border-gray-100 ml-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              {editingEntryId === segment.id ? (
                                <Input
                                  value={editingDescription}
                                  onChange={(e) => setEditingDescription(e.target.value)}
                                  onBlur={() => handleDescriptionSave(segment.id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleDescriptionSave(segment.id)}
                                  className="h-7 text-sm py-1 w-full"
                                  autoFocus
                                />
                              ) : (
                                <div
                                  onClick={() => handleDescriptionEdit(segment.id, segment.description)}
                                  className="text-xs text-gray-700 cursor-pointer hover:text-blue-600"
                                >
                                  {segment.description || "Add description"}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestartEntry(segment)}
                                className="text-gray-300 hover:text-blue-500 p-1 h-auto"
                              >
                                <Play className="w-3 h-3 fill-current" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBackendEntry(segment.id)}
                                className="text-gray-300 hover:text-red-500 p-1 h-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                            <span>{segment.startTime} - {segment.endTime}</span>
                            <span className="font-mono">{segment.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block mt-16">
        <div className="flex flex-col w-full h-full min-h-screen space-y-10 px-4">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4 max-w-[1600px] mx-auto">
              <Input
                placeholder="What are you working on?"
                className="flex-1 border-gray-300 focus:border-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3">
                    <span className="text-blue-500 font-medium">{selectedProject ? selectedProject.name : "Project"}</span>
                    <ChevronDown className="w-4 h-4 text-blue-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="p-3 border-b">
                    <Search className="inline-block w-4 h-4 mr-2" />
                    <Input
                      placeholder="Search Project..."
                      value={searchProject}
                      onChange={(e) => setSearchProject(e.target.value)}
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredProjects.map((p) => (
                      <DropdownMenuItem key={p.id} onClick={() => handleProjectSelect(p)}>
                        <div className={`w-3 h-3 rounded-full mr-2 ${p.color}`}></div>
                        {p.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-xl font-mono">{formatTime(currentTime)}</div>
              <Button onClick={handleTimerToggle} className={isTimerRunning ? "bg-red-500" : "bg-blue-500"}>
                {isTimerRunning ? "STOP" : "START"}
              </Button>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">This week</h2>
              </div>
              <span className="font-bold">Total: {calculateWeekTotal()}</span>
            </div>

            {groupedEntries.map((dayGroup) => (
              <div key={format(dayGroup.date, "yyyy-MM-dd")} className="mb-6">
                <div className="bg-gray-100 px-4 py-2 flex justify-between items-center rounded-t-lg border">
                  <span className="font-bold">{getDateLabel(dayGroup.date)}</span>
                  <span className="font-mono text-gray-600">Total: {formatTime(dayGroup.totalSeconds)}</span>
                </div>
                <div className="bg-white border-x border-b rounded-b-lg shadow-sm divide-y divide-gray-100">
                  {dayGroup.activities.map((activity) => (
                    <div key={activity.id} className="flex flex-col">
                      {/* Activity Summary Row */}
                      <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                          <button
                            onClick={() => toggleGroup(activity.id)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.has(activity.id) ? 'rotate-180' : ''}`} />
                          </button>

                          <div className="flex-1 min-w-0">
                            {editingEntryId === activity.segments[0].id ? (
                              <Input
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                onBlur={() => handleDescriptionSave(activity.segments[0].id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDescriptionSave(activity.segments[0].id)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 text-sm"
                                autoFocus
                              />
                            ) : (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDescriptionEdit(activity.segments[0].id, activity.description);
                                }}
                                className="text-gray-800 font-medium truncate block cursor-pointer hover:text-blue-600 transition-colors"
                              >
                                {activity.description || "Add description"}
                                {activity.segments.length > 1 && (
                                  <span className="ml-3 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                                    {activity.segments.length}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          <div
                            className="flex items-center gap-2 px-4 border-l border-gray-100 shrink-0 cursor-pointer hover:bg-blue-50 rounded py-1 transition-colors group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectActivity(activity);
                            }}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${activity.project.color}`}></div>
                            <span className="text-sm text-blue-500 font-medium group-hover:underline">
                              {activity.project.name}{activity.taskId ? ` - ${activity.segments[0].raw.task?.title}` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-10 shrink-0 ml-10">
                          <div className="text-lg font-bold text-gray-700 font-mono w-[100px] text-right">
                            {formatTime(activity.totalSeconds)}
                          </div>
                          <div className="flex items-center gap-3 w-[80px] justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestartEntry(activity.segments[0])}
                              className="text-gray-300 hover:text-blue-500 p-2 h-auto rounded-full"
                              title="Restart this activity"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Individual Segments (Expanded) */}
                      {expandedGroups.has(activity.id) && (
                        <div className="bg-gray-50 border-t border-gray-100 py-1">
                          {activity.segments.map((segment) => (
                            <div key={segment.id} className="flex items-center justify-between px-16 py-2 hover:bg-white transition-colors border-l-4 border-blue-200">
                              <div className="flex-1 min-w-0 mr-10">
                                {editingEntryId === segment.id ? (
                                  <Input
                                    value={editingDescription}
                                    onChange={(e) => setEditingDescription(e.target.value)}
                                    onBlur={() => handleDescriptionSave(segment.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleDescriptionSave(segment.id)}
                                    className="h-7 text-xs py-0 w-full"
                                    autoFocus
                                  />
                                ) : (
                                  <div
                                    onClick={() => handleDescriptionEdit(segment.id, segment.description)}
                                    className="text-xs text-gray-500 truncate cursor-pointer hover:text-blue-600"
                                  >
                                    {segment.description || "Add description"}
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-400 font-medium flex items-center gap-4 shrink-0">
                                <span>{segment.startTime} - {segment.endTime}</span>
                              </div>
                              <div className="flex items-center gap-10 shrink-0">
                                <div className="text-sm text-gray-400 font-mono w-[100px] text-right">
                                  {segment.duration}
                                </div>
                                <div className="flex items-center gap-3 w-[80px] justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRestartEntry(segment)}
                                    className="text-gray-300 hover:text-blue-500 p-1.5 h-auto rounded-full"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteBackendEntry(segment.id)}
                                    className="text-gray-200 hover:text-red-500 p-1.5 h-auto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Creation Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create Project</h3>
            <Input placeholder="Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="mb-4" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
              <Button onClick={createNewProject}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map(t => <CustomToast key={t.id} toast={t} onClose={removeToast} />)}
      </div>
    </div>
  )
}

export default TimeTrackerPage