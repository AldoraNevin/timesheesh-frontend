"use client"

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { motion } from "framer-motion"
import React, { useState, useEffect } from 'react'
import { profileService } from '@/lib/api'
import type { Profile } from '@/lib/api/types'

const weekData = [
  { key: "Mon, Aug 11", date: "Mon, Aug 11", seconds: 0, durationText: "00:00:00" },
  { key: "Tue, Aug 12", date: "Tue, Aug 12", seconds: 0, durationText: "00:00:00" },
  { key: "Wed, Aug 13", date: "Wed, Aug 13", seconds: 0, durationText: "00:00:00" },
  { key: "Thu, Aug 14", date: "Thu, Aug 14", seconds: 2, durationText: "00:00:02" },
  { key: "Fri, Aug 15", date: "Fri, Aug 15", seconds: 0, durationText: "00:00:00" },
  { key: "Sat, Aug 16", date: "Sat, Aug 16", seconds: 0, durationText: "00:00:00" },
  { key: "Sun, Aug 17", date: "Sun, Aug 17", seconds: 0, durationText: "00:00:00" },
]

const pieData = [
  { name: "Without project", value: 2 },
]

const COLORS = ["#cbd5e1"] // slate-300 (proche du gris de la capture)

function formatH(seconds: number) {
  // Convertit des secondes en "HH:MM:SS"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

const TickTwoLines: React.FC<any> = ({ x, y, payload }) => {
  // Affiche la durée au dessus et la date en dessous (visuel proche de la capture)
  const item = weekData.find(d => d.key === payload.value)
  const duration = item?.durationText ?? "00:00:00"
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={-8} textAnchor="middle" fontSize={12} fill="#94a3b8">{duration}</text>
      <text x={0} y={16} textAnchor="middle" fontSize={12} fill="#94a3b8">{payload.value}</text>
    </g>
  )
}

const YTickHours: React.FC<any> = ({ x, y, payload }) => (
  <text x={x} y={y} dy={3} textAnchor="end" fontSize={12} fill="#cbd5e1">
    {Number(payload.value).toFixed(2)}h
  </text>
)

const EmptyTooltip = () => null

const totalSeconds = 2


const DashBoardPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [isEmployee, setIsEmployee] = useState(false)

  // Fetch current user profile to check role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfile()
        setCurrentUser(profile)
        setIsEmployee(profile.role === "employee")
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        setIsEmployee(false)
      }
    }

    fetchProfile()
  }, [])

  // Employee Dashboard - Simple view
  if (isEmployee) {
    return (
      <div className='mt-18'>
        <div className="flex flex-col sm:flex-row mt-4 sm:mt-8 md:mt-12 lg:mt-16 gap-4 sm:gap-0">
          <h2 className="text-gray-400 font-bold text-xl sm:text-2xl">Dashboard</h2>
        </div>
        
        <div className="min-h-screen w-full bg-slate-100 p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* KPI Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-md border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="text-slate-400 text-sm">Total time this week</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide mt-2">{formatH(totalSeconds)}</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="rounded-md border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="text-slate-400 text-sm">Projects</div>
                <div className="text-slate-400 text-lg sm:text-xl mt-2">--</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-md border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="text-slate-400 text-sm">This month</div>
                <div className="text-slate-400 text-lg sm:text-xl mt-2">--</div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin/Other roles - Full dashboard
  return (
<div className='mt-18'>
  <div className="flex flex-col sm:flex-row mt-4 sm:mt-8 md:mt-12 lg:mt-16 gap-4 sm:gap-0">
    <h2 className="text-gray-400 font-bold text-xl sm:text-2xl">Dashboard</h2>
    <div className="flex flex-wrap gap-2 sm:ml-auto sm:flex-nowrap">
      <Select>
        <SelectTrigger className="w-full sm:w-[150px] lg:w-[180px]">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Project">Project</SelectItem>
          <SelectItem value="dark">Billability</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-full sm:w-[150px] lg:w-[180px]">
          <SelectValue placeholder="Only me" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Only me">Only me</SelectItem>
          <SelectItem value="Team">Team</SelectItem>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-[150px] lg:w-[180px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>This week</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button className='bg-transparent text-black w-1/2 sm:w-auto'><ChevronLeft/></Button>
        <Button className='bg-transparent text-black w-1/2 sm:w-auto'><ChevronRight/></Button>
      </div>
    </div>
  </div>
  
  <div className="min-h-screen w-full bg-slate-100 p-2 sm:p-3 md:p-4 lg:p-6">
    <div className="mx-auto max-w-[1400px]">
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Colonne principale */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3 rounded-md border border-slate-200 bg-white"
        >
          {/* Bandeau KPI - Stack on mobile */}
          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-100/60">
            <div className="p-3 sm:p-4 md:p-5">
              <div className="text-slate-400 text-sm">Total time</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide">{formatH(totalSeconds)}</div>
            </div>
            <div className="p-3 sm:p-4 md:p-5">
              <div className="text-slate-400 text-sm">Top Project</div>
              <div className="text-slate-400 text-lg sm:text-xl">--</div>
            </div>
            <div className="p-3 sm:p-4 md:p-5">
              <div className="text-slate-400 text-sm">Top Client</div>
              <div className="text-slate-400 text-lg sm:text-xl">--</div>
            </div>
          </div>

          {/* Graphes */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-6">
            {/* Bar chart - Height adjusts based on screen size */}
            <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[360px] border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData} margin={{ 
                  top: 20, 
                  right: 10, 
                  left: 10, 
                  bottom: 30 
                }}>
                  <CartesianGrid vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="key"
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="middle" 
                          fill="#666" 
                          fontSize={window.innerWidth < 640 ? 10 : 12}
                        >
                          {payload.value.split(' ')[0]}
                        </text>
                        {window.innerWidth >= 640 && (
                          <text 
                            x={0} 
                            y={0} 
                            dy={30} 
                            textAnchor="middle" 
                            fill="#999" 
                            fontSize={10}
                          >
                            {payload.value.split(' ')[1]}
                          </text>
                        )}
                      </g>
                    )}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={window.innerWidth < 640 ? 40 : 60}
                  />
                  <YAxis
                    tick={({ x, y, payload }) => (
                      <text 
                        x={x} 
                        y={y} 
                        textAnchor="end" 
                        fill="#666" 
                        fontSize={window.innerWidth < 640 ? 10 : 12}
                      >
                        {formatH(payload.value * 3600)}
                      </text>
                    )}
                    axisLine={false}
                    tickLine={false}
                    width={window.innerWidth < 640 ? 30 : 40}
                    domain={[0, 1]}
                  />
                  <RechartsTooltip content={<EmptyTooltip />} />
                  <Bar dataKey="seconds" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bas : donut + barre horizontale - Stack on mobile */}
            <div className="mt-4 grid gap-4 md:gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Donut - Fixed aspect ratio */}
                <div className="aspect-square w-full max-w-[300px] mx-auto md:max-w-none">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="80%"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                        isAnimationActive={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none -mt-24 flex items-center justify-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-medium text-slate-600">
                      {formatH(totalSeconds)}
                    </div>
                  </div>
                </div>

                {/* Répartition "Without project" */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-6 rounded bg-slate-300" />
                      <span>Without project</span>
                    </div>
                    <div className="font-medium">{formatH(totalSeconds)}</div>
                  </div>
                  <div className="h-4 sm:h-6 w-full rounded bg-slate-200 overflow-hidden">
                    <div className="h-full w-full bg-slate-300" />
                  </div>
                  <div className="mt-1 sm:mt-2 text-right text-slate-400 text-xs sm:text-sm">100,00%</div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Colonne latérale droite - Full width on mobile, fixed on larger screens */}
        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-md border border-slate-200 bg-white lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/60 px-3 py-2 sm:px-4 sm:py-3">
            <div className="text-slate-500 font-medium text-sm sm:text-base">Most tracked activities</div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Top 10"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Top 10'>Top 10</SelectItem>
                <SelectItem value='All'>All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste */}
          <div className="p-2 sm:p-3 md:p-4">
            <div className="flex items-start justify-between rounded border border-slate-200 bg-white px-3 py-2 sm:py-3">
              <div className="text-slate-600 text-xs sm:text-sm">
                <div className="font-medium">(no description)</div>
                <div className="mt-1 text-[11px] sm:text-[13px] text-slate-400">• (no Project)</div>
              </div>
              <div className="text-slate-500 text-xs sm:text-sm font-medium mt-3 sm:mt-5">00:00:02</div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  </div>
</div>
  )
}

export default DashBoardPage 