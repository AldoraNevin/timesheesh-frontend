"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, Calendar, Printer, Share2, Filter } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

// Data for the first section
const projectData = [
  {
    id: 1,
    title: "DevPrepAi",
    duration: "00:00:06",
    amount: "0,00",
    currency: "USD",
  },
]

// Data for the donut chart
const donutData = [{ name: "DevPrepAi", value: 6, color: "#9333ea" }]

// Data for the bar chart
const weeklyData = [
  { day: "Mon, Aug 18", time: "00:00:00", value: 0 },
  { day: "Tue, Aug 19", time: "00:00:00", value: 0 },
  { day: "Wed, Aug 20", time: "00:00:06", value: 6 },
  { day: "Thu, Aug 21", time: "00:00:00", value: 0 },
  { day: "Fri, Aug 22", time: "00:00:00", value: 0 },
  { day: "Sat, Aug 23", time: "00:00:00", value: 0 },
  { day: "Sun, Aug 24", time: "00:00:00", value: 0 },
]

const filterOptions = [
  {
    value: "team",
    label: "Team",
    options: ["Team A", "Team B", "Team C"] // Exemple, à adapter selon vos données
  },
  {
    value: "client",
    label: "Client",
    options: ["NO CLIENT", "timesheesh", "Der/PrepAl", "Max steel", "new-tube"]
  },
  {
    value: "project",
    label: "Project",
    options: ["Project 1", "Project 2", "Without Project"]
  },
  {
    value: "task",
    label: "Task",
    options: ["Task 1", "Task 2", "Task 3"]
  },
  {
    value: "tag",
    label: "Tag",
    options: ["Urgent", "Important", "Review"]
  },
  {
    value: "status",
    label: "Status",
    options: ["Active", "Completed", "Pending"]
  },
  {
    value: "description",
    label: "Description",
    options: ["Contains", "Does not contain"]
  }
];


export default function ReportsPage() {

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[filterType] || [];
      
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [filterType]: currentFilters.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentFilters, value]
        };
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 mt-15">
      {/* First Section - Time Report (previously second) */}
      <Card className="bg-white shadow-sm mb-8">
        <CardContent className="p-0">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                <Select defaultValue="time-report">
                  <SelectTrigger className="w-full sm:w-40 border-none shadow-none text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time-report">Time Report</SelectItem>
                    <SelectItem value="team-report">Team Report</SelectItem>
                    <SelectItem value="expense-report">Expense Report</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1 overflow-x-auto">
                  <Button variant="ghost" className="text-sm font-medium text-gray-900 bg-gray-100 whitespace-nowrap">
                    Summary
                  </Button>
                  <Button variant="ghost" className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    Detailed
                  </Button>
                  <Button variant="ghost" className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    Weekly
                  </Button>
                  <Button variant="ghost" className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    Shared
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">This week</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 px-4 md:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Select defaultValue="filter">
        <SelectTrigger className="w-28 border-none shadow-none text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="FILTER" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="filter">FILTER</SelectItem>
        </SelectContent>
      </Select>

      {filterOptions.map((filter) => (
        <DropdownMenu key={filter.value}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              {filter.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {filter.options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={selectedFilters[filter.value]?.includes(option) || false}
                onCheckedChange={() => handleFilterChange(filter.value, option)}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
              </div>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white px-6 w-full sm:w-auto">APPLY FILTER</Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="border-b border-gray-200 px-4 md:px-6 py-4 bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-lg font-bold text-gray-900">00:00:06</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Billable:</span>
                  <span className="text-lg font-bold text-gray-900">00:00:06</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-lg font-bold text-gray-900">0,00 USD</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <Select defaultValue="export">
                  <SelectTrigger className="w-20 border-none shadow-none text-sm text-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Rounding</span>
                <Select defaultValue="show-amount">
                  <SelectTrigger className="w-32 border-none shadow-none text-sm text-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="show-amount">Show amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-4 md:p-6">
            <div className="mb-4">
              <Select defaultValue="billability">
                <SelectTrigger className="w-24 border border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billability">Billability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-64 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    angle={0}
                    textAnchor="middle"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(value) => `${value}.00h`}
                  />
                  <Bar dataKey="value" fill="#84cc16" radius={[4, 4, 0, 0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Labels */}
            <div className="flex justify-center mt-4">
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Section - Project Overview (previously first) */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4 md:p-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <span className="text-sm text-gray-600">Group by:</span>
            <div className="flex flex-wrap items-center gap-4">
              <Select defaultValue="project">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="description">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Show estimate</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Left side - Table */}
            <div className="flex-1">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">TITLE</span>
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="hidden sm:flex gap-16 md:gap-32">
                      <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">DURATION</span>
                      <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">AMOUNT</span>
                    </div>
                  </div>
                </div>

                {/* Table Row */}
                {projectData.map((project) => (
                  <div key={project.id} className="px-4 py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{project.id}</span>
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">{project.title}</span>
                      </div>
                      <div className="flex gap-8 sm:gap-16 md:gap-32 ml-8 sm:ml-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                          <span className="text-xs text-gray-500 sm:hidden">Duration:</span>
                          <span className="text-sm text-gray-900">{project.duration}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                          <span className="text-xs text-gray-500 sm:hidden">Amount:</span>
                          <span className="text-sm text-gray-900">
                            {project.amount} {project.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Donut Chart */}
            <div className="w-full xl:w-80 flex justify-center">
              <div className="relative w-80 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-900">00:00:06</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
