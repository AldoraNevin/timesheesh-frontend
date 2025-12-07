"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

interface Project {
  id: string
  name: string
  color: string
  tasks: number
  isFavorite?: boolean 
}

interface TimeEntry {
  id: string
  description: string
  project: Project
  startTime: string
  endTime: string
  duration: string
  date: Date
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
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 bg-white min-w-[320px] max-w-[400px] transition-all duration-300 ${
        toast.type === "success" ? "border-l-green-500" : "border-l-red-500"
      } ${
        isExiting
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

const TimeTrackerPage = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchProject, setSearchProject] = useState("")
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
  const [currentTime, setCurrentTime] = useState(0)
  const [description, setDescription] = useState("")
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingDescription, setEditingDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState('blue');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: "1",
      description: "Add description",
      project: { id: "1", name: "Max steel", color: "bg-blue-500", tasks: 2 },
      startTime: "13:24",
      endTime: "13:25",
      duration: "00:00:29",
      date: new Date()
    },
  ])

  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "timesheesh", color: "bg-purple-500", tasks: 1 },
    { id: "2", name: "DevPrepAI", color: "bg-teal-500", tasks: 1 },
    { id: "3", name: "Max steel", color: "bg-blue-500", tasks: 2 },
  ])

  const calculateWeekTotal = () => {
    let totalSeconds = 0
    timeEntries.forEach((entry) => {
      const [hours, minutes, seconds] = entry.duration.split(":").map(Number)
      totalSeconds += hours * 3600 + minutes * 60 + seconds
    })
    return formatTime(totalSeconds)
  }

  const toggleProjectFavorite = (projectId: string) => {
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

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-US', options)}-${end.toLocaleDateString('en-US', options)}`
  }

  const handleTimerToggle = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true)
      setCurrentTime(0)
      showToast("Timer started", "The timer has been successfully started.", "success")
    } else {
      if (!selectedProject) {
        showToast("Project required", "You must select a project before stopping the timer.", "error")
        return
      }

      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + currentTime * 1000)

      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        description: description || "Add description",
        project: selectedProject,
        startTime: startTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        endTime: endTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        duration: formatTime(currentTime),
        date: new Date()
      }

      setTimeEntries((prev) => [newEntry, ...prev])
      setIsTimerRunning(false)
      setCurrentTime(0)
      setDescription("")

      showToast("Timer stopped", `Time recorded for ${selectedProject.name}: ${formatTime(currentTime)}`, "success")
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

  const handleDescriptionSave = (entryId: string) => {
    const newDescription = editingDescription.trim() || "Add description"
    setTimeEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, description: newDescription } : entry)),
    )
    setEditingEntryId(null)
    setEditingDescription("")
    showToast("Description updated", "The description has been successfully modified.", "success")
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
      id: Date.now().toString(),
      name: newProjectName.trim(),
      color: `bg-${selectedColor}-500`, // Utilise la couleur sélectionnée
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
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">NO CLIENT</div>
                    <div className="px-3 py-1 text-xs text-gray-400">{filteredProjects.length} Projects</div>

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
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">Create Task</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation(); // Empêche la sélection du projet
                              toggleProjectFavorite(project.id);
                            }}
                          >
                            <Star 
                              className={`w-4 h-4 ${
                                project.isFavorite 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                            />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}

                      {/* Bouton "Create new Project" */}
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
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <Tag className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md">
                  <DollarSign className="w-5 h-5 text-blue-500 border-l-2 border-r-2 border-dashed border-blue-400 px-2" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-lg text-gray-700">{formatTime(currentTime)}</div>
                <Button
                  onClick={handleTimerToggle}
                  className={`px-4 py-2 text-white ${
                    isTimerRunning ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      STOP
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      START
                    </>
                  )}
                </Button>
                <button className="p-2">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="font-medium">Today</span>
            <div className="flex items-center gap-3">
              <span className="text-lg">{calculateWeekTotal()}</span>
              <Copy className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {timeEntries.map((entry) => (
            <div key={entry.id} className="p-4 space-y-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  {editingEntryId === entry.id ? (
                    <Input
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      onKeyDown={(e) => handleDescriptionKeyPress(e, entry.id)}
                      onBlur={() => handleDescriptionSave(entry.id)}
                      placeholder="Add description"
                      className="p-0"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-gray-600 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      onClick={() => handleDescriptionEdit(entry.id, entry.description)}
                    >
                      {entry.description}
                    </div>
                  )}
                </div>
                <span className="text-lg">{entry.duration}</span>
              </div>

              <div className="flex items-center gap-2 ml-5">
                <div className={`w-3 h-3 rounded-full ${entry.project.color}`}></div>
                <span className="text-blue-500 text-sm">{entry.project.name}</span>
              </div>

              <div className="flex items-center justify-between ml-5">
                <div className="flex items-center gap-4">
                  <DollarSign className="w-5 h-5 text-blue-500 border-l-2 border-r-2 border-dashed border-blue-400 px-2" />
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{entry.startTime}</span>
                    <span>-</span>
                    <span>{entry.endTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Play className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => deleteTimeEntry(entry.id)} className="p-1 hover:bg-gray-100 rounded">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block mt-10">
        <div className="flex flex-col w-full h-full min-h-screen mt-10 space-y-10 px-4">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-4 max-w-7xl mx-auto">
              <div className="flex-1 flex items-center gap-4">
                <Input
                  placeholder="What are you working on?"
                  className="flex-1 border-gray-300 focus:border-blue-500 text-gray-700 placeholder:text-gray-400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-blue-500 text-blue-500">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-blue-500 font-medium">
                        {selectedProject ? selectedProject.name : "Project"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-blue-500" />
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
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">NO CLIENT</div>
                      <div className="px-3 py-1 text-xs text-gray-400">{filteredProjects.length} Projects</div>

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
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">Create Task</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation(); // Empêche la sélection du projet
                                toggleProjectFavorite(project.id);
                              }}
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  project.isFavorite 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300 hover:text-gray-400'
                                }`}
                              />
                            </Button>
                          </div>
                        </DropdownMenuItem>
                      ))}

                      {/* Bouton "Create new Project" */}
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

              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <Tag className="w-5 h-5 text-gray-400" />
                </button>

                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </button>

                <div className="text-xl text-gray-700 min-w-[80px] text-center">{formatTime(currentTime)}</div>

                <Button
                  onClick={handleTimerToggle}
                  className={`px-6 py-2 rounded-md text-white ${
                    isTimerRunning ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      STOP
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      START
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-5">
            <div className="text-xl font-semibold text-gray-800">
              {formatDateRange(selectedDateRange.start, selectedDateRange.end)}
            </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Week total:</span>
                <span className="font-bold text-gray-800">{calculateWeekTotal()}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="w-full bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium">Today</div>

              {timeEntries.map((entry) => (
                <div key={entry.id} className="bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-[200px]">
                        {editingEntryId === entry.id ? (
                          <Input
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            onKeyDown={(e) => handleDescriptionKeyPress(e, entry.id)}
                            onBlur={() => handleDescriptionSave(entry.id)}
                            placeholder="Add description"
                            className="text-gray-600 border-none p-0 h-auto focus:ring-0"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="text-gray-600 cursor-pointer hover:bg-gray-50 p-1 rounded"
                            onClick={() => handleDescriptionEdit(entry.id, entry.description)}
                          >
                            {entry.description}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-blue-500 text-sm whitespace-nowrap">
                        <div className={`w-3 h-3 rounded-full ${entry.project.color}`}></div>
                        <span>{entry.project.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <Tag className="w-7 h-7 text-gray-400 border-r-2 border-l-2 border-dashed border-gray-300 pr-1 pl-1" />
                        </button>

                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <DollarSign className="w-6 h-6 text-blue-500 border-r-2 border-dashed border-gray-300 pr-1" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                        <span>{entry.startTime}</span>
                        <span>-</span>
                        <span>{entry.endTime}</span>
                      </div>
                      
                      <Popover>
                        <PopoverTrigger>
                          <CalendarIcon className="text-sm text-gray-300 border-r-2 border-dashed border-gray-300 pr-1 cursor-pointer hover:text-gray-400" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={entry.date}
                            onSelect={(date) => {
                              if (date) {
                                updateEntryDate(entry.id, date)
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <div className="text-gray-700 min-w-[70px] text-center border-r-2 border-dashed border-gray-300 pr-1">
                        {entry.duration}
                      </div>

                      <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <Play className="w-6 h-6 text-gray-400 border-r-2 border-dashed border-gray-300 pr-1" />
                        </button>

                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Creation Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-800">Create new Project</h3>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setNewProjectName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Project Name and Client Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input 
                    placeholder="Enter Project name" 
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-client">No client</SelectItem>
                      <SelectItem value="client1">Client 1</SelectItem>
                      <SelectItem value="client2">Client 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Color Selection and Options Row */}
              <div className="flex items-center justify-between">
                {/* Color Picker */}
                <div className="flex items-center space-x-4">
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-12 h-8 p-0 border-0">
                      <div className={`w-8 h-6 bg-${selectedColor}-500 rounded mx-auto`}></div>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="grid grid-cols-3 gap-2 w-24">
                          <SelectItem value="pink" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-pink-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="purple" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-purple-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="blue" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-blue-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="teal" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-teal-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="green" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-green-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="yellow" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-yellow-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="orange" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-orange-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="red" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-red-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                          <SelectItem value="gray" className="p-0 h-6 w-6">
                            <div className="w-6 h-6 bg-gray-500 rounded cursor-pointer hover:scale-110 transition-transform"></div>
                          </SelectItem>
                        </div>
                      </div>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="public" defaultChecked />
                    <Label htmlFor="public" className="text-sm text-gray-700">Public</Label>
                  </div>
                </div>

                <div>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="No template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-template">No template</SelectItem>
                      <SelectItem value="template1">Template 1</SelectItem>
                      <SelectItem value="template2">Template 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setNewProjectName("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createNewProject}
                  disabled={!newProjectName.trim()}
                >
                  CREATE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <CustomToast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  )
}

export default TimeTrackerPage