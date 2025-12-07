"use client"

import React, { useMemo, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, EllipsisVertical, X } from "lucide-react"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const tabs = ["REQUESTS", "TIMELINE", "BALANCE"]

export default function TimeOffPage() {
  const [activeTab, setActiveTab] = useState("REQUESTS")
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState("")

  const [offset, setOffset] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Calcule les 5 semaines à partir du lundi de la semaine actuelle
  const weeks = useMemo(() => {
    const start = new Date()
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(start.setDate(diff + offset * 35))

    const days = []
    for (let i = 0; i < 35; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      days.push(new Date(date))
    }
    return days
  }, [offset])

  const handlePrev = () => setOffset(offset - 1)
  const handleNext = () => setOffset(offset + 1)

  const handleReject = () => {
    console.log("Rejected with note:", rejectNote)
    setIsRejectModalOpen(false)
    setRejectNote("")
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f8fa] p-6 flex flex-col mt-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Time off</h1>
        <Button className="bg-[#00aaff] hover:bg-[#0093dd] text-white rounded-sm">
          REQUEST TIME OFF
        </Button>
      </div>

      <div className="flex flex-col">
        {/* Tabs */}
        <div className="flex space-x-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-sm font-semibold border border-b-0 transition-all duration-150 rounded-t-none
                ${
                  activeTab === tab
                    ? "border-gray-300 bg-white text-gray-800"
                    : "border-gray-200 bg-[#f2f6f8] text-gray-500"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5 bg-white text-gray-700 border-t-0">
          {activeTab === "REQUESTS" && (
            <div className="rounded-md shadow-sm border border-gray-200 border-t-0">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4 justify-between">
                <div className="flex flex-wrap gap-3">
                  <Select>
                    <SelectTrigger className="w-[180px] h-8 text-sm border-gray-300">
                      <SelectValue placeholder="Show all time off" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Show all time off</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick leave</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[120px] h-8 text-sm border-gray-300">
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">Developers</SelectItem>
                      <SelectItem value="design">Designers</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-[120px] h-8 text-sm border-gray-300">
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="px-4 py-1 text-sm">
                  Export
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-t border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="py-3 px-4">TEAM MEMBER</th>
                      <th className="py-3 px-4">PERIOD</th>
                      <th className="py-3 px-4">REQUESTED</th>
                      <th className="py-3 px-4">POLICY</th>
                      <th className="py-3 px-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "[SAMPLE] Lara Peterson",
                        avatar: "/avatars/avatar1.png",
                        period: "Oct 8 - Oct 10, 2025",
                        note: "Requested on Oct 1",
                        requested: "3,00d of 8,00d",
                        policy: "[SAMPLE] Vacation",
                        status: "Pending",
                        color: "bg-yellow-100 text-yellow-700",
                        action: "Approve",
                      },
                      {
                        name: "[SAMPLE] Mike Johnson",
                        avatar: "/avatars/avatar2.png",
                        period: "Oct 2 - Oct 2, 2025",
                        note: "Requested on Oct 1",
                        requested: "1,00d",
                        policy: "[SAMPLE] Vacation",
                        status: "Rejected",
                        color: "bg-red-100 text-red-700",
                        action: "",
                      },
                      {
                        name: "[SAMPLE] Amy Smith",
                        avatar: "/avatars/avatar3.png",
                        period: "Oct 1 - Oct 2, 2025",
                        note: "Requested on Oct 1",
                        requested: "2,00d",
                        policy: "[SAMPLE] Vacation",
                        status: "Approved",
                        color: "bg-green-100 text-green-700",
                        action: "",
                      },
                    ].map((item, i) => (
                      <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 flex items-center space-x-3 min-w-[200px]">
                          <Image
                            src={item.avatar}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <span className="text-gray-700">{item.name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.period}
                          <div className="text-xs text-gray-400">{item.note}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.requested}</td>
                        <td className="py-3 px-4 text-gray-600">{item.policy}</td>
                        <td className="py-3 px-4 text-gray-600 flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-sm text-xs font-medium ${item.color}`}>
                            {item.status}
                          </span>
                          {item.action ? (
                            <button className="text-[#00aaff] text-sm font-medium hover:underline">
                              {item.action}
                            </button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <EllipsisVertical className="w-5 h-5 text-gray-500 cursor-pointer" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem 
                                  className="text-red-500 hover:bg-red-50 cursor-pointer"
                                  onClick={() => setIsRejectModalOpen(true)}
                                >
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  Withdraw
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

{activeTab === "TIMELINE" && (
  <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
    {/* Header avec navigation */}
    <div className="flex items-center justify-between px-4 py-2 border-b bg-[#f9fbfc]">
      <div className="flex items-center space-x-2">
        <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
          <button
            onClick={handlePrev}
            className="px-2 py-1 hover:bg-gray-100 border-r border-gray-300"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="px-2 py-1 hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="text-sm text-gray-700 font-medium">
          {weeks[0].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })} {" - "}
          {weeks[weeks.length - 1].toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
      <div className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded-sm bg-white cursor-pointer">
        Team ▼
      </div>
    </div>

    {/* Container principal avec largeur limitée */}
    <div className="relative">
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100"
        style={{ 
          maxWidth: 'calc(240px + 840px)', // 240px colonne gauche + 840px (3 semaines)
        }}
      >
        <div className="flex min-w-max">
          {/* Colonne gauche sticky - BIEN ALIGNÉE */}
          <div className="flex flex-col flex-shrink-0 w-60 border-r border-gray-200 bg-[#f9fbfc] sticky left-0 z-10">
            <div className="text-xs text-gray-500 px-4 py-2 border-b border-gray-200 bg-[#f9fbfc] h-12 flex items-center">
              Team member
            </div>
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white h-14">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border border-gray-200">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 15.75a7.5 7.5 0 017.5 4.368" />
                </svg>
              </div>
              <span className="ml-3 text-sm text-gray-700 truncate">[SAMPLE] Lara Peterson</span>
            </div>
          </div>

          {/* Partie calendrier - 5 SEMAINES COMPLÈTES */}
          <div className="flex-1 min-w-[1400px] bg-white"> {/* 5 semaines × 280px */}
            {/* En-têtes des dates - BIEN ALIGNÉES */}
            <div className="flex border-b border-gray-200 bg-[#f9fbfc] h-12">
              {Array.from({ length: 5 }).map((_, weekIndex) => {
                const weekStart = weeks[weekIndex * 7];
                const weekEnd = weeks[weekIndex * 7 + 6];
                const isSameMonth = weekStart.getMonth() === weekEnd.getMonth();
                return (
                  <div
                    key={weekIndex}
                    className="flex flex-col border-r border-gray-300 last:border-r-0 relative"
                    style={{ width: `280px` }}
                  >
                    {/* Séparateur vertical entre semaines */}
                    {weekIndex > 0 && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                    )}
                    
                    <div className="text-xs text-gray-700 font-medium py-2 h-6 flex items-center justify-center border-b border-gray-200">
                      {!isSameMonth
                        ? `${weekStart.toLocaleDateString("en-US", { month: "short" })}-${weekEnd.toLocaleDateString("en-US", { month: "short" })}`
                        : weekStart.toLocaleDateString("en-US", { month: "short" })}
                    </div>
                    <div className="flex w-full">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const dateIndex = weekIndex * 7 + dayIndex;
                        const date = weeks[dateIndex];
                        const isCurrentDay = new Date().toDateString() === date.toDateString();
                        const isWeekend = dayIndex === 5 || dayIndex === 6;
                        return (
                          <div
                            key={dayIndex}
                            className={`flex-1 flex flex-col items-center justify-center border-r border-gray-100 last:border-r-0 min-w-[40px] max-w-[40px] h-10 ${
                              isCurrentDay ? "text-blue-600 font-bold bg-blue-50" : 
                              isWeekend ? "text-gray-400 bg-gray-50" : "text-gray-600"
                            }`}
                          >
                            <span className="text-xs">{date.getDate().toString().padStart(2, '0')}</span>
                            <span className="text-[10px] opacity-60">
                              {date.toLocaleDateString("en-US", { weekday: "narrow" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ligne du membre avec période de congé - BIEN ALIGNÉE */}
            <div className="flex border-b border-gray-200 bg-white h-14">
              {Array.from({ length: 35 }).map((_, i) => {
                const weekIndex = Math.floor(i / 7);
                const isWeekStart = i % 7 === 0 && i > 0;
                const isLeave = i >= 1 && i <= 3;
                
                return (
                  <div
                    key={i}
                    className={`flex-1 border-r border-gray-100 last:border-r-0 min-w-[40px] max-w-[40px] h-full flex items-center justify-center relative ${
                      isLeave ? "bg-green-200" : ""
                    }`}
                    style={{ width: `40px` }}
                  >
                    {/* Séparateur vertical entre semaines */}
                    {isWeekStart && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400 z-10"></div>
                    )}
                    
                    {isLeave && i === 1 && (
                      <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g>
                          <path d="M31.9032 33.9592L23.2582 25.3142C22.927 24.9831 22.763 24.5935 22.7661 24.1454C22.7694 23.6974 22.9334 23.3099 23.2582 22.9829C23.5851 22.6563 23.9743 22.4929 24.4257 22.4929C24.8768 22.4929 25.2658 22.6563 25.5927 22.9829L34.2277 31.6279C34.5525 31.9527 34.7148 32.3396 34.7148 32.7888C34.7148 33.2376 34.5525 33.6245 34.2277 33.9492C33.903 34.2761 33.5162 34.4413 33.0673 34.4446C32.6182 34.4479 32.2301 34.2861 31.9032 33.9592ZM7.77566 31.3163C6.70594 29.796 5.90941 28.1828 5.38607 26.4767C4.86274 24.7708 4.60107 23.0453 4.60107 21.3C4.60107 19.0978 5.00941 16.9578 5.82607 14.88C6.64274 12.8025 7.88288 10.9318 9.54649 9.26793C11.2101 7.60432 13.0839 6.36584 15.1677 5.55251C17.2516 4.7389 19.3914 4.33209 21.5869 4.33209C23.3322 4.33209 25.0559 4.59084 26.7582 5.10834C28.4604 5.62584 30.0682 6.41737 31.5815 7.48293C32.147 7.87543 32.45 8.41654 32.4902 9.10626C32.5305 9.79598 32.2912 10.4004 31.7723 10.9196L11.1848 31.5071C10.6657 32.0263 10.0652 32.2656 9.38357 32.225C8.70163 32.1847 8.16566 31.8818 7.77566 31.3163ZM9.63232 28.5458L12.2757 25.8946C11.8334 25.2949 11.4009 24.6643 10.9782 24.0029C10.5554 23.3413 10.169 22.6536 9.81899 21.94C9.46899 21.2261 9.17232 20.4926 8.92899 19.7396C8.68566 18.9865 8.50705 18.2232 8.39316 17.4496C7.80899 19.3374 7.63357 21.2453 7.86691 23.1733C8.09996 25.1011 8.68844 26.892 9.63232 28.5458ZM14.4048 23.8571L24.1319 14.0563C22.9041 13.1149 21.6629 12.3645 20.4082 11.805C19.1534 11.2456 17.9658 10.8688 16.8452 10.6746C15.725 10.4804 14.72 10.4633 13.8302 10.6233C12.9408 10.7833 12.2497 11.1097 11.7569 11.6025C11.2639 12.107 10.9501 12.8007 10.8157 13.6838C10.6812 14.5665 10.7204 15.5582 10.9332 16.6588C11.1459 17.7593 11.5425 18.9254 12.1227 20.1571C12.7027 21.3888 13.4634 22.6221 14.4048 23.8571ZM28.8944 9.35709C27.2125 8.3207 25.4023 7.69862 23.464 7.49084C21.5257 7.28307 19.6104 7.49209 17.7182 8.11793C18.4684 8.23626 19.2108 8.41709 19.9452 8.66043C20.68 8.90376 21.4041 9.19057 22.1177 9.52084C22.8316 9.85084 23.5262 10.2272 24.2015 10.65C24.877 11.0731 25.5309 11.5232 26.1632 12.0004L28.8944 9.35709Z" fill="#8CA5B2"></path>
                        </g>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
)}

{activeTab === "BALANCE" && (
 <div className="w-full bg-[#f5f8fa] p-4">
      {/* Header dropdowns */}
      <div className="flex space-x-2 mb-3">
        <div className="relative">
          <button className="border rounded px-3 py-1 bg-white text-sm flex items-center">
            Policy <span className="ml-1">▼</span>
          </button>
        </div>

        <div className="relative">
          <button className="border rounded px-3 py-1 bg-white text-sm flex items-center w-48 justify-between">
            [SAMPLE] Vacation <span>▼</span>
          </button>
        </div>

        <div className="ml-auto">
          <button className="border rounded px-3 py-1 bg-white text-sm flex items-center">
            Export <span className="ml-1">▼</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f8fafb] text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left p-3 font-medium w-[40%]"> </th>
              <th className="text-left p-3 font-medium">Accrued</th>
              <th className="text-left p-3 font-medium">Used</th>
              <th className="text-left p-3 font-medium">Available</th>
              <th className="w-[5%]"></th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {/* Row 1 */}
            <tr className="border-t">
              <td className="flex items-center space-x-3 p-3">
                <input type="checkbox" className="mr-2" />
                <Image
                  src="/avatars/1.png"
                  alt="Amy Smith"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span>[SAMPLE] Amy Smith</span>
              </td>
              <td className="p-3">16,00d</td>
              <td className="p-3">2,00d</td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span>14,00d</span>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div className="bg-green-500 h-2 rounded w-[85%]" />
                  </div>
                </div>
              </td>
              <td className="p-3 text-right">⋮</td>
            </tr>

            {/* Row 2 */}
            <tr className="border-t">
              <td className="flex items-center space-x-3 p-3">
                <input type="checkbox" className="mr-2" />
                <Image
                  src="/avatars/2.png"
                  alt="James Anderson"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span>[SAMPLE] James Anderson</span>
              </td>
              <td className="p-3">12,00d</td>
              <td className="p-3">0,00d</td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span>12,00d</span>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div className="bg-green-500 h-2 rounded w-[100%]" />
                  </div>
                </div>
              </td>
              <td className="p-3 text-right">⋮</td>
            </tr>

            {/* Row 3 */}
            <tr className="border-t">
              <td className="flex items-center space-x-3 p-3">
                <input type="checkbox" className="mr-2" />
                <Image
                  src="/avatars/3.png"
                  alt="Lara Peterson"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span>[SAMPLE] Lara Peterson</span>
              </td>
              <td className="p-3">8,00d</td>
              <td className="p-3">3,00d</td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span>5,00d</span>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div className="bg-green-500 h-2 rounded w-[60%]" />
                  </div>
                </div>
              </td>
              <td className="p-3 text-right">⋮</td>
            </tr>

            {/* Row 4 */}
            <tr className="border-t">
              <td className="flex items-center space-x-3 p-3">
                <input type="checkbox" className="mr-2" />
                <Image
                  src="/avatars/4.png"
                  alt="Mike Johnson"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span>[SAMPLE] Mike Johnson</span>
              </td>
              <td className="p-3">9,00d</td>
              <td className="p-3">0,00d</td>
              <td className="p-3">
                <div className="flex flex-col">
                  <span>9,00d</span>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div className="bg-green-500 h-2 rounded w-[100%]" />
                  </div>
                </div>
              </td>
              <td className="p-3 text-right">⋮</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
)}
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[465px] p-0 gap-0">
          {/* Header avec bordure */}
          <DialogHeader className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-normal text-gray-700">
                Reject time off
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm text-gray-700">
                Note <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="note"
                placeholder="Add a note"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="min-h-[100px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer avec boutons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="px-6 py-2 text-sm font-medium text-white bg-[#f87171] hover:bg-[#ef4444] rounded transition-colors"
            >
              REJECT
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}