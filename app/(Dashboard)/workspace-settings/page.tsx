"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function WorkspacePage() {
  const [settings, setSettings] = useState({
    // Timesheet & Kiosk
    activateTimesheet: false,
    activateKiosk: false,

    // Project defaults
    projectBillable: "billable",
    projectVisibility: "public",

    // Favorites & Features
    enableFavoriteEntries: false,
    enableBreaks: false,
    activateProjectFavorites: true,

    // Rates & Billing
    enableHourlyRates: false,
    enableBillableTasks: false,
    enableApproval: false,
    activateTimeOff: false,
    enableInvoicing: false,

    // Advanced Features
    activateExpenseTracking: false,
    activateCostRate: false,
    activateProjectScheduling: false,
    activateGPSTracking: false,
    activateScreenshotCapture: false,

    // Form fields
    workspaceName: "maxdev",
    workspaceBillableRate: "0",

    // Required fields
    requiredProject: false,
    requiredTask: false,
    requiredTag: false,
    requiredDescription: false,

    // Organize time by
    organizeBy: {
      client: "Client",
      project: "Project",
      task: "Task",
    },

    // Duration format
    durationFormat: "Full (hh:mm:ss)",

    // Week start
    weekStart: "Monday",

    // Working days
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

    // Currencies
    currency: "USD",

    // Number format
    numberFormat: "3.456,78",

    // Time rounding
    timeRounding: "Round to nearest, 15 minutes",
  })

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const tabs = [
    "GENERAL",
    "PERMISSIONS",
    "ALERTS",
    "ACCOUNTS",
    "AUTHENTICATION",
    "CUSTOM FIELDS",
    "INTEGRATIONS",
    "ADD-ONS",
    "IMPORT",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  index === 0
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Company Logo Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Company logo</h2>
          <p className="text-gray-600 text-sm mb-4">
            Company logo will appear in shared reports and branded PDF exports. Formats: png, jpg. Max size: 5 MB.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              MA
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600">UPLOAD IMAGE</Button>
          </div>
        </div>

        {/* Workspace Name */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Workspace name</h2>
          <Input
            value={settings.workspaceName}
            onChange={(e) => updateSetting("workspaceName", e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Timesheet */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Timesheet</h2>
          <p className="text-gray-600 text-sm mb-4">
            Enter time on Tasks and Projects using a weekly timesheet view. While activated, Project is a required field
            for the whole workspace.
          </p>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.activateTimesheet}
              onCheckedChange={(checked) => updateSetting("activateTimesheet", checked)}
            />
            <Label>Activate timesheet</Label>
          </div>
        </div>

        {/* Kiosk */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Kiosk</h2>
          <p className="text-gray-600 text-sm mb-4">Allow employees to clock in and out from designated devices.</p>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.activateKiosk}
              onCheckedChange={(checked) => updateSetting("activateKiosk", checked)}
            />
            <Label>Activate kiosk</Label>
          </div>
        </div>

        {/* New Projects are by default */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">New Projects are by default</h2>
          <p className="text-gray-600 text-sm mb-4">
            When you create a Project, make it public so it's available to all users, and billable so its time entries
            are set as billable.
          </p>

          <div className="space-y-4">
            <RadioGroup
              value={settings.projectBillable}
              onValueChange={(value) => updateSetting("projectBillable", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-billable" id="non-billable" />
                <Label htmlFor="non-billable">Non-billable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="billable" id="billable" />
                <Label htmlFor="billable">Billable</Label>
              </div>
            </RadioGroup>

            <RadioGroup
              value={settings.projectVisibility}
              onValueChange={(value) => updateSetting("projectVisibility", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">Public</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Private</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Organize time by */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Organize time by</h2>
          <p className="text-gray-600 text-sm mb-4">
            Choose how you wish to group time, and set up custom terms and hierarchy.
          </p>

          <div className="space-y-4 max-w-md">
            <Select
              value={settings.organizeBy.client}
              onValueChange={(value) => updateSetting("organizeBy", { ...settings.organizeBy, client: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={settings.organizeBy.project}
              onValueChange={(value) => updateSetting("organizeBy", { ...settings.organizeBy, project: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Job">Job</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={settings.organizeBy.task}
              onValueChange={(value) => updateSetting("organizeBy", { ...settings.organizeBy, task: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="Activity">Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duration format */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Duration format</h2>
          <p className="text-gray-600 text-sm mb-4">Display time in clock format (with or without seconds).</p>

          <Select value={settings.durationFormat} onValueChange={(value) => updateSetting("durationFormat", value)}>
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full (hh:mm:ss)">Full (hh:mm:ss)</SelectItem>
              <SelectItem value="Compact (hh:mm)">Compact (hh:mm)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Week start */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Week start</h2>
          <p className="text-gray-600 text-sm mb-4">
            Default week start for all new members (you can override week start on member's profile).
          </p>

          <Select value={settings.weekStart} onValueChange={(value) => updateSetting("weekStart", value)}>
            <SelectTrigger className="max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monday">Monday</SelectItem>
              <SelectItem value="Sunday">Sunday</SelectItem>
              <SelectItem value="Saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Working days */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Working days</h2>
          <p className="text-gray-600 text-sm mb-4">
            Default working days for all new members (you can override working days on member's profile).
          </p>

          <div className="flex gap-2 text-sm">
            {settings.workingDays.map((day, index) => (
              <span key={day} className={`px-2 py-1 rounded ${index < 5 ? "text-blue-600" : "text-gray-400"}`}>
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Project and Task favorites */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Project and Task favorites</h2>
          <p className="text-gray-600 text-sm mb-4">
            Let people mark their most used Projects and Tasks as favorite so they appear at the top of the list when
            tracking time.
          </p>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.activateProjectFavorites}
              onCheckedChange={(checked) => updateSetting("activateProjectFavorites", checked)}
            />
            <Label>Activate Project and Task favorites</Label>
          </div>
        </div>

        {/* Workspace billable rate */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Workspace billable rate</h2>
          <p className="text-gray-600 text-sm mb-4">
            Default value of each billable hour when there's no user or Project hourly rate.
          </p>

          <div className="flex items-center gap-2 max-w-md">
            <Input
              value={settings.workspaceBillableRate}
              onChange={(e) => updateSetting("workspaceBillableRate", e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" className="text-blue-600 bg-transparent">
              Change
            </Button>
          </div>
        </div>

        {/* Currencies */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Currencies</h2>
          <p className="text-gray-600 text-sm mb-4">
            Add additional currencies for hourly rates and expenses, and then assign them to Clients.
          </p>

          <div className="flex items-center gap-2 max-w-md">
            <Select value={settings.currency} onValueChange={(value) => updateSetting("currency", value)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="text-blue-600 bg-transparent">
              Edit
            </Button>
          </div>
        </div>

        {/* Data format */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Data format</h2>
          <p className="text-gray-600 text-sm mb-4">
            Choose preferred number and currency format for the whole workspace.
          </p>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Number format</Label>
              <Select value={settings.numberFormat} onValueChange={(value) => updateSetting("numberFormat", value)}>
                <SelectTrigger className="max-w-md mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3.456,78">3.456,78</SelectItem>
                  <SelectItem value="3,456.78">3,456.78</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Currency format</Label>
              <div className="mt-1 text-sm text-gray-600">Based on selected currency</div>
            </div>
          </div>
        </div>

        {/* BASIC features */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-blue-800">BASIC features</span>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              Upgrade
            </Button>
          </div>

          {/* Favorite entries */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Favorite entries</h3>
            <p className="text-gray-600 text-sm mb-3">
              Mark time entries as favorites and use pre-populated entries to track time.
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.enableFavoriteEntries}
                onCheckedChange={(checked) => updateSetting("enableFavoriteEntries", checked)}
              />
              <Label>Enable favorite entries</Label>
            </div>
          </div>

          {/* Do not allow saving time without */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Do not allow saving time without</h3>
            <p className="text-gray-600 text-sm mb-3">
              Entries with missing required fields won't be saved. Only visible custom fields can be required.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.requiredProject}
                  onCheckedChange={(checked) => updateSetting("requiredProject", checked)}
                />
                <Label>Project</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.requiredTask}
                  onCheckedChange={(checked) => updateSetting("requiredTask", checked)}
                />
                <Label>Task</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.requiredTag}
                  onCheckedChange={(checked) => updateSetting("requiredTag", checked)}
                />
                <Label>Tag</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={settings.requiredDescription}
                  onCheckedChange={(checked) => updateSetting("requiredDescription", checked)}
                />
                <Label>Description</Label>
              </div>
            </div>
          </div>

          {/* Breaks */}
          <div>
            <h3 className="font-semibold mb-2">Breaks</h3>
            <p className="text-gray-600 text-sm mb-3">Track and manage your team's break hours.</p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.enableBreaks}
                onCheckedChange={(checked) => updateSetting("enableBreaks", checked)}
              />
              <Label>Enable breaks</Label>
            </div>
          </div>
        </div>

        {/* STANDARD features */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-blue-800">STANDARD features</span>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              Upgrade
            </Button>
          </div>

          {/* Time rounding */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Time rounding</h3>
            <p className="text-gray-600 text-sm mb-3">Round time in reports up, down, or to nearest X minutes.</p>
            <div className="text-blue-600 text-sm">{settings.timeRounding}</div>
          </div>

          {/* Task rates */}
          <div>
            <h3 className="font-semibold mb-2">Task rates</h3>
            <p className="text-gray-600 text-sm mb-3">
              Have a different rate depending on the Task on a Project, plus choose whether Tasks are billable by
              default.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.enableHourlyRates}
                  onCheckedChange={(checked) => updateSetting("enableHourlyRates", checked)}
                />
                <Label>Enable hourly rates for Task</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.enableBillableTasks}
                  onCheckedChange={(checked) => updateSetting("enableBillableTasks", checked)}
                />
                <Label>Enable billable and non-billable Tasks</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional sections */}
        <div className="space-y-6">
          {/* Approval */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Approval</h3>
            <p className="text-gray-600 text-sm mb-3">
              Your team can submit their timesheets for review, which you can approve or reject.
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.enableApproval}
                onCheckedChange={(checked) => updateSetting("enableApproval", checked)}
              />
              <Label>Enable approval</Label>
            </div>
          </div>

          {/* Time off */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Time off</h3>
            <p className="text-gray-600 text-sm mb-3">
              Define time off policies and holidays, request vacations, see when people are away, and track accruals and
              remaining balances.
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.activateTimeOff}
                onCheckedChange={(checked) => updateSetting("activateTimeOff", checked)}
              />
              <Label>Activate time off</Label>
            </div>
          </div>

          {/* Invoicing */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-2">Invoicing</h3>
            <p className="text-gray-600 text-sm mb-3">
              Create and download invoices for Clients based on tracked time.
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.enableInvoicing}
                onCheckedChange={(checked) => updateSetting("enableInvoicing", checked)}
              />
              <Label>Enable invoicing</Label>
            </div>
          </div>
        </div>

        {/* PRO features */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-blue-800">PRO features</span>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              Upgrade
            </Button>
          </div>

          <div className="space-y-6">
            {/* Expenses */}
            <div>
              <h3 className="font-semibold mb-2">Expenses</h3>
              <p className="text-gray-600 text-sm mb-3">
                Record work-related expenses by sum or unit, along with the receipts, and include them in invoices.
              </p>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.activateExpenseTracking}
                  onCheckedChange={(checked) => updateSetting("activateExpenseTracking", checked)}
                />
                <Label>Activate expense tracking</Label>
              </div>
            </div>

            {/* Cost and profit analysis */}
            <div>
              <h3 className="font-semibold mb-2">Cost and profit analysis</h3>
              <p className="text-gray-600 text-sm mb-3">
                Set labor cost rates and see in reports what you charge Clients vs what you pay your team.
              </p>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.activateCostRate}
                  onCheckedChange={(checked) => updateSetting("activateCostRate", checked)}
                />
                <Label>Activate cost rate</Label>
              </div>
            </div>

            {/* Scheduling */}
            <div>
              <h3 className="font-semibold mb-2">Scheduling</h3>
              <p className="text-gray-600 text-sm mb-3">
                Plan Projects, define team capacity, and assign who works on what, when, and for how long.
              </p>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.activateProjectScheduling}
                  onCheckedChange={(checked) => updateSetting("activateProjectScheduling", checked)}
                />
                <Label>Activate Project and team scheduling</Label>
              </div>
            </div>

            {/* Track location */}
            <div>
              <h3 className="font-semibold mb-2">Track location</h3>
              <p className="text-gray-600 text-sm mb-3">
                See all Clients job sites that were visited by your remote field workers who clock-in via the mobile app
                (iOS & Android).
              </p>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.activateGPSTracking}
                  onCheckedChange={(checked) => updateSetting("activateGPSTracking", checked)}
                />
                <Label>Activate GPS tracking</Label>
              </div>
            </div>

            {/* Capture screenshots */}
            <div>
              <h3 className="font-semibold mb-2">Capture screenshots</h3>
              <p className="text-gray-600 text-sm mb-3">
                Generate screenshots every 5 minutes while the timer is running (desktop app only).
              </p>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.activateScreenshotCapture}
                  onCheckedChange={(checked) => updateSetting("activateScreenshotCapture", checked)}
                />
                <Label>Activate screenshot capturing</Label>
              </div>
            </div>
          </div>
        </div>

        {/* ENTERPRISE feature */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800">ENTERPRISE feature</span>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
