"use client"

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, ChevronLeft, ChevronRight, MoreVertical, Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { adminService } from "@/lib/api";
import type { User } from "@/lib/api/types";

type ModalType = "approve" | "remind" | "submit" | null;
type TabType = "pending" | "unsubmitted" | "archive";

const ApprovalsPage = () => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedUserForSubmit, setSelectedUserForSubmit] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const users = await adminService.getAllUsers();
        
        // Map User[] to string[] (using full_name or email)
        const userNames = users.map((user: User) => 
          user.full_name || user.email.split("@")[0]
        );
        
        setAllUsers(userNames);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setApiError(err.message || "Gagal memuat data pengguna");
        // Fallback to empty array or show error
        setAllUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleRowExpansion = (index: number) => {
    setExpandedRows(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleApproveAll = () => {
    setModalType("approve");
  };

  const handleRemindToApprove = () => {
    setModalType("remind");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedUserForSubmit(null);
  };

  const handleConfirmApprove = () => {
    console.log("Approving all timesheets...");
    setModalType(null);
  };

  const handleSendReminder = () => {
    console.log("Sending reminders...");
    setModalType(null);
  };

  const handleSubmitTime = (user: string) => {
    setSelectedUserForSubmit(user);
    setModalType("submit");
  };

  const handleConfirmSubmit = () => {
    console.log(`Submitting time for ${selectedUserForSubmit}...`);
    setModalType(null);
    setSelectedUserForSubmit(null);
  };

  const handleUserSelect = (user: string) => {
    setSelectedUsers(prev => 
      prev.includes(user) 
        ? prev.filter(u => u !== user)
        : [...prev, user]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...allUsers]);
    }
    setSelectAll(!selectAll);
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "pending":
        return (
          <div className="space-y-6">
            {/* Week 1 */}
            <div className="border-none rounded-sm">
              {/* Filters + Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select>
                    <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm border border-gray-300">
                      <SelectValue placeholder="Sort by: Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date" className="text-sm">Sort by: Date</SelectItem>
                      <SelectItem value="name" className="text-sm">Sort by: Name</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm border border-gray-300">
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent className="w-[280px] p-0" align="start">
                      {/* En-tête avec recherche */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search users or groups"
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Filtre SHOW */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">SHOW</span>
                          <Select defaultValue="active">
                            <SelectTrigger className="h-7 w-[100px] text-xs border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Section USERS */}
                      <div className="p-3">
                        {/* Case à cocher Select all */}
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox 
                            id="select-all-pending" 
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                          <label
                            htmlFor="select-all-pending"
                            className="text-sm font-medium text-gray-700"
                          >
                            Select all
                          </label>
                        </div>

                        {/* Titre USERS */}
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            USERS
                          </span>
                        </div>

                        {/* Liste des utilisateurs */}
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {allUsers.map((user, index) => (
                            <div key={index} className="flex items-center space-x-2 py-1">
                              <Checkbox 
                                id={`user-pending-${index}`}
                                checked={selectedUsers.includes(user)}
                                onCheckedChange={() => handleUserSelect(user)}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <label
                                htmlFor={`user-pending-${index}`}
                                className="text-sm text-gray-700 flex-1"
                              >
                                {user}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Bouton REMIND TO APPROVE */}
                  <button
                    onClick={handleRemindToApprove}
                    className="h-9 px-5 text-sm cursor-pointer font-medium border border-blue-500 text-blue-500 bg-white hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 flex items-center justify-center"
                  >
                    REMIND TO APPROVE
                  </button>

                  {/* Bouton APPROVE ALL */}
                  <button
                    onClick={handleApproveAll}
                    className="h-9 px-5 text-sm cursor-pointer font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1 flex items-center justify-center"
                  >
                    APPROVE ALL
                  </button>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="bg-[#f2f6f8] text-sm px-5 py-3 font-medium">
                  Sep 22, 2025 - Sep 28, 2025
                </div>
                <div className="grid grid-cols-4 text-xs uppercase text-gray-400 px-5 py-3 border-b border-gray-200">
                  <div>User</div>
                  <div className="text-right">Team Manager</div>
                  <div className="text-right">Time</div>
                  <div className="text-right">Time Off</div>
                </div>
                <div className="grid grid-cols-4 px-5 py-3 text-sm border-t border-gray-200">
                  <div>[SAMPLE] Amy Smith</div>
                  <div className="text-right">[SAMPLE] James Anderson</div>
                  <div className="text-right">09:00:00</div>
                  <div className="text-right">0,00h</div>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {/* Week 1 Mobile */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#f2f6f8] text-sm px-4 py-3 font-medium">
                    Sep 22, 2025 - Sep 28, 2025
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {/* User Card */}
                    <div className="p-4">
                      <button
                        onClick={() => toggleRowExpansion(0)}
                        className="w-full flex justify-between items-center text-left"
                      >
                        <div>
                          <div className="font-medium text-gray-900">[SAMPLE] Amy Smith</div>
                          <div className="text-sm text-gray-500 mt-1">Click to view details</div>
                        </div>
                        <ChevronRight 
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            expandedRows.includes(0) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      
                      {expandedRows.includes(0) && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Team Manager</span>
                            <span className="text-sm font-medium">[SAMPLE] James Anderson</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Time</span>
                            <span className="text-sm font-medium">09:00:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Time Off</span>
                            <span className="text-sm font-medium">0,00h</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Week 2 Mobile */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#f2f6f8] text-sm px-4 py-3 font-medium">
                    Jun 9, 2025 - Jun 15, 2025
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {/* User Card */}
                    <div className="p-4">
                      <button
                        onClick={() => toggleRowExpansion(1)}
                        className="w-full flex justify-between items-center text-left"
                      >
                        <div>
                          <div className="font-medium text-gray-900">[SAMPLE] Amy Smith</div>
                          <div className="text-sm text-gray-500 mt-1">Click to view details</div>
                        </div>
                        <ChevronRight 
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            expandedRows.includes(1) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      
                      {expandedRows.includes(1) && (
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Team Manager</span>
                            <span className="text-sm font-medium">[SAMPLE] James Anderson</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Time</span>
                            <span className="text-sm font-medium">04:00:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Time Off</span>
                            <span className="text-sm font-medium">0,00h</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "unsubmitted":
        return (
          <div className="w-full bg-white border border-gray-200 rounded-sm">
            {/* Top controls */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Calendar avec chevrons */}
                <div className="flex items-center space-x-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "h-9 w-full sm:w-[140px] flex items-center justify-start text-left font-normal text-sm border border-r-0 rounded-none px-3"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        This week
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="[&_.rdp-day]:rounded-none"
                      />
                    </PopoverContent>
                  </Popover>
      
                  {/* Chevron buttons */}
                  <div className="flex ml-1">
                    <button className="h-9 w-8 border border-l-0 flex items-center justify-center rounded-none">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="h-9 w-8 border border-l-0 flex items-center justify-center rounded-none">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Team Select */}
                <Select>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm border border-gray-300">
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent className="w-[280px] p-0" align="start">
                    {/* En-tête avec recherche */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users or groups"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Filtre SHOW */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">SHOW</span>
                        <Select defaultValue="active">
                          <SelectTrigger className="h-7 w-[100px] text-xs border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Section USERS */}
                    <div className="p-3">
                      {/* Case à cocher Select all */}
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox 
                          id="select-all-pending" 
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <label
                          htmlFor="select-all-pending"
                          className="text-sm font-medium text-gray-700"
                        >
                          Select all
                        </label>
                      </div>

                      {/* Titre USERS */}
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          USERS
                        </span>
                      </div>

                      {/* Liste des utilisateurs */}
                      <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {allUsers.map((user, index) => (
                          <div key={index} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                              id={`user-pending-${index}`}
                              checked={selectedUsers.includes(user)}
                              onCheckedChange={() => handleUserSelect(user)}
                              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                            <label
                              htmlFor={`user-pending-${index}`}
                              className="text-sm text-gray-700 flex-1"
                            >
                              {user}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SelectContent>
                </Select>
              </div>
      
              {/* REMIND TO SUBMIT Button */}
              <button className="h-9 px-4 text-sm font-medium border border-blue-500 text-blue-500 bg-white hover:bg-blue-50 transition-colors w-full sm:w-auto">
                REMIND TO SUBMIT
              </button>
            </div>
      
            {/* Desktop Table */}
            <div className="hidden lg:block">
              {/* Date Header */}
              <div className="bg-[#f2f6f8] text-sm font-medium px-4 py-3 border-b border-gray-200">
                Sep 29, 2025 - Oct 5, 2025
              </div>
      
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_40px] gap-4 px-4 py-3 border-b border-gray-200">
                <div className="text-xs uppercase text-gray-500 font-medium">USER</div>
                <div className="text-xs uppercase text-gray-500 font-medium text-right pr-4">TIME</div>
                <div className="text-xs uppercase text-gray-500 font-medium text-right">TIME OFF</div>
                <div></div>
              </div>
      
              {/* Table Rows */}
              <div className="divide-y divide-gray-200">
                {[
                  { name: "[SAMPLE] Mike Johnson", time: "16:00:00", off: "0,00h" },
                  { name: "[SAMPLE] James Anderson", time: "17:00:00", off: "0,00h" },
                  { name: "[SAMPLE] Lara Peterson", time: "21:00:00", off: "0,00h" },
                  { name: "[SAMPLE] Amy Smith", time: "19:00:00", off: "16,00h" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_auto_40px] gap-4 px-4 py-3 items-center hover:bg-gray-50"
                  >
                    <div className="text-sm text-gray-900">{row.name}</div>
                    <div className="text-sm text-gray-900 text-right pr-4">{row.time}</div>
                    <div className="text-sm text-gray-900 text-right">{row.off}</div>
                    <div className="flex justify-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-[#f2f6f8] rounded">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-0" align="end">
                          <button
                            onClick={() => handleSubmitTime(row.name)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#f2f6f8]"
                          >
                            SUBMIT
                          </button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {/* Date Header */}
              <div className="bg-[#f2f6f8] text-sm font-medium px-4 py-3 border-b border-gray-200">
                Sep 29, 2025 - Oct 5, 2025
              </div>

              {/* Mobile User Cards */}
              <div className="divide-y divide-gray-200">
                {[
                  { name: "[SAMPLE] Mike Johnson", time: "16:00:00", off: "0,00h" },
                  { name: "[SAMPLE] James Anderson", time: "17:00:00", off: "0,00h" },
                  { name: "[SAMPLE] Lara Peterson", time: "21:00:00", off: "0,00h" },
                  { name: "[SAMPLE] Amy Smith", time: "19:00:00", off: "16,00h" },
                ].map((row, i) => (
                  <div key={i} className="p-4">
                    <button
                      onClick={() => toggleRowExpansion(i + 10)}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{row.name}</div>
                        <div className="text-sm text-gray-500 mt-1">Click to view details</div>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          expandedRows.includes(i + 10) ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    
                    {expandedRows.includes(i + 10) && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Time</span>
                          <span className="text-sm font-medium">{row.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Time Off</span>
                          <span className="text-sm font-medium">{row.off}</span>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleSubmitTime(row.name)}
                            className="px-4 py-2 text-sm font-medium border border-blue-500 text-blue-500 bg-white hover:bg-blue-50 transition-colors"
                          >
                            SUBMIT
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
      
            {/* Footer */}
            <div className="flex justify-center py-4 border-t border-gray-200">
              <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Show users without time and expenses
              </button>
            </div>
          </div>
        );

      case "archive":
        return (
          <div className="space-y-6">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select>
                <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm border border-gray-300">
                  <SelectValue placeholder="Sort by: Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date" className="text-sm">Sort by: Date</SelectItem>
                  <SelectItem value="name" className="text-sm">Sort by: Name</SelectItem>
                </SelectContent>
              </Select>
      
              <Select>
                <SelectTrigger className="w-full sm:w-[100px] h-9 text-sm border border-gray-300">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1" className="text-sm">Team 1</SelectItem>
                  <SelectItem value="team2" className="text-sm">Team 2</SelectItem>
                </SelectContent>
              </Select>
      
              <Select>
                <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm border border-gray-300">
                  <SelectValue placeholder="Show all" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">Show all</SelectItem>
                  <SelectItem value="approved" className="text-sm">Approved</SelectItem>
                  <SelectItem value="withdrawn" className="text-sm">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
      
            {/* Desktop Archive */}
            <div className="hidden lg:block space-y-6">
              {/* Première période - Aug 18, 2025 */}
              <div className="border border-gray-200 rounded-sm">
                <div className="bg-[#f2f6f8] text-sm px-4 py-3 font-medium">
                  Aug 18, 2025 - Aug 24, 2025
                </div>
                
                {/* En-têtes de colonnes */}
                <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 font-medium">USER</div>
                  <div className="text-xs uppercase text-gray-500 font-medium text-right">TIME</div>
                  <div className="text-xs uppercase text-gray-500 font-medium text-right">STATUS</div>
                </div>
                
                {/* Ligne de données */}
                <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                  <div className="text-sm text-gray-900">[SAMPLE] Lara Peterson</div>
                  <div className="text-sm text-gray-900 text-right">12:00:00</div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
      
              {/* Deuxième période - Jun 23, 2025 */}
              <div className="border border-gray-200 rounded-sm">
                <div className="bg-[#f2f6f8] text-sm px-4 py-3 font-medium">
                  Jun 23, 2025 - Jun 29, 2025
                </div>
                
                {/* En-têtes de colonnes */}
                <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 font-medium">USER</div>
                  <div className="text-xs uppercase text-gray-500 font-medium text-right">TIME</div>
                  <div className="text-xs uppercase text-gray-500 font-medium text-right">STATUS</div>
                </div>
                
                {/* Ligne de données */}
                <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                  <div className="text-sm text-gray-900">[SAMPLE] Amy Smith</div>
                  <div className="text-sm text-gray-900 text-right">12:00:00</div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-400 text-gray-800">
                      Withdrawn
                    </span>
                  </div>
                </div>
              </div>
      
              {/* Troisième période - Jun 16, 2025 */}
              <div className="border border-gray-200 rounded-sm">
                <div className="bg-[#f2f6f8] text-sm px-4 py-3 font-medium">
                  Jun 16, 2025 - Jun 22, 2025
                </div>
                
                {/* En-têtes de colonnes */}
                <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 font-medium">USER</div>
                  <div className="text-xs uppercase text-gray-500 font-medium text-right">TIME</div>
                  <div className="text-xs uppercase text-gray-500 font-medium text-right">STATUS</div>
                </div>
                
                {/* Ligne de données */}
                <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 border-b border-gray-200 hover:bg-gray-50">
                  <div className="text-sm text-gray-900">[SAMPLE] Amy Smith</div>
                  <div className="text-sm text-gray-900 text-right">11:00:00</div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Archive */}
            <div className="lg:hidden space-y-4">
              {[
                { period: "Aug 18, 2025 - Aug 24, 2025", user: "[SAMPLE] Lara Peterson", time: "12:00:00", status: "Approved", statusColor: "bg-green-200 text-green-800" },
                { period: "Jun 23, 2025 - Jun 29, 2025", user: "[SAMPLE] Amy Smith", time: "12:00:00", status: "Withdrawn", statusColor: "bg-gray-400 text-gray-800" },
                { period: "Jun 16, 2025 - Jun 22, 2025", user: "[SAMPLE] Amy Smith", time: "11:00:00", status: "Approved", statusColor: "bg-green-200 text-green-800" },
              ].map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#f2f6f8] text-sm px-4 py-3 font-medium">
                    {item.period}
                  </div>
                  
                  <div className="p-4">
                    <button
                      onClick={() => toggleRowExpansion(index + 20)}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{item.user}</div>
                        <div className="text-sm text-gray-500 mt-1">Click to view details</div>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          expandedRows.includes(index + 20) ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    
                    {expandedRows.includes(index + 20) && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Time</span>
                          <span className="text-sm font-medium">{item.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Status</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
 <div className="min-h-screen bg-gray-50 p-4 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="mt-6 mb-6">
          <h1 className="text-2xl text-gray-600 font-bold ml-1">Approvals</h1>
        </div>
        <div className="flex flex-col bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex space-x-2 border-b overflow-x-auto">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-4 sm:px-8 py-3 text-sm font-semibold border border-b-0 flex-shrink-0 ${
                activeTab === "pending" 
                  ? "border-gray-300 bg-white text-gray-800" 
                  : "border-gray-200 bg-[#f2f6f8] text-gray-500"
              }`}
            >
              PENDING
            </button>
            <button 
              onClick={() => setActiveTab("unsubmitted")}
              className={`px-4 sm:px-8 py-3 text-sm font-semibold border border-b-0 flex-shrink-0 ${
                activeTab === "unsubmitted" 
                  ? "border-gray-300 bg-white text-gray-800" 
                  : "border-gray-200 bg-[#f2f6f8] text-gray-500"
              }`}
            >
              UNSUBMITTED
            </button>
            <button 
              onClick={() => setActiveTab("archive")}
              className={`px-4 sm:px-8 py-3 text-sm font-semibold border border-b-0 flex-shrink-0 ${
                activeTab === "archive" 
                  ? "border-gray-300 bg-white text-gray-800" 
                  : "border-gray-200 bg-[#f2f6f8] text-gray-500"
              }`}
            >
              ARCHIVE
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 bg-white text-gray-700 border-t-0">
            {getTabContent()}
          </div>
        </div>
      </div>

      {/* Modal pour Approve/Remind */}
      {modalType !== null && modalType !== "submit" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-normal text-gray-700">
                {modalType === "approve" 
                  ? "Approve all" 
                  : "Remind to approve time and expenses"}
              </h2>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-6">
              <p className="text-sm sm:text-base text-black font-bold leading-relaxed">
                {modalType === "approve" 
                  ? "Once everything is approved, time will be locked and no one will be able to edit it anymore."
                  : "Ready to send email reminders to team managers who haven't yet approved their team's pending timesheets?"}
              </p>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-5 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 sm:px-6 py-2 text-sm font-medium text-[#00a8e1] hover:text-[#0096ca] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modalType === "approve" ? handleConfirmApprove : handleSendReminder}
                className="px-4 sm:px-6 py-2 text-sm font-semibold bg-[#00a8e1] hover:bg-[#0096ca] text-white transition-colors tracking-wide"
              >
                {modalType === "approve" ? "APPROVE ALL" : "SEND"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour Submit */}
      {modalType === "submit" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-normal text-gray-700">
                Submit for approval
              </h2>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-6">
              <p className="text-sm sm:text-base text-black font-bold leading-relaxed">
                Ready to submit Sep 29 - Oct 5 for approval, for {selectedUserForSubmit}?
              </p>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-5 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 sm:px-6 py-2 text-sm font-medium text-[#00a8e1] hover:text-[#0096ca] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 sm:px-6 py-2 text-sm font-semibold bg-[#00a8e1] hover:bg-[#0096ca] text-white transition-colors tracking-wide"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;