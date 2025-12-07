"use client";

import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

interface Tab {
  name: string;
  clickable: boolean;
}

interface TeamMember {
  name: string;
  avatar?: string;
  initials?: string;
  lastSeen: string;
  color: string;
}

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<string>("Screenshots");
  const [mapPosition, setMapPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const tabs: Tab[] = [
    { name: "ACTIVITY", clickable: false },
    { name: "Screenshots", clickable: true },
    { name: "Locations", clickable: true }
  ];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Colors untuk avatar
  const colors = [
    "bg-orange-400",
    "bg-blue-400",
    "bg-pink-400",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-400",
    "bg-red-400",
  ];

  // Helper untuk generate initials dari name
  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const { adminService } = await import("@/lib/api");
        const users = await adminService.getAllUsers();
        
        // Map User[] to TeamMember[]
        const mappedMembers: TeamMember[] = users.map((user: any, index: number) => {
          const name = user.full_name || user.email.split("@")[0];
          const initials = getInitials(name);
          return {
            name: name,
            initials: initials,
            lastSeen: "-",
            color: colors[index % colors.length],
          };
        });
        
        setTeamMembers(mappedMembers);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setApiError(err.message || "Gagal memuat data pengguna");
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handlers pour le drag de la carte
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - mapPosition.x,
      y: e.clientY - mapPosition.y
    });
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    
    // Limites de déplacement (ajustables selon la taille de votre carte)
    const maxX = 400;
    const maxY = 300;
    const minX = -400;
    const minY = -300;
    
    setMapPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({
      x: touch.clientX - mapPosition.x,
      y: touch.clientY - mapPosition.y
    });
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - startPos.x;
    const newY = touch.clientY - startPos.y;
    
    const maxX = 400;
    const maxY = 300;
    const minX = -400;
    const minY = -300;
    
    setMapPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startPos, mapPosition]);

  return (
    <div className="min-h-screen bg-[#f5f9fc] p-4 md:p-6 flex flex-col items-center mt-12 md:mt-20">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between w-full max-w-7xl mb-6 md:mb-10 gap-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <Button
              key={tab.name}
              onClick={() => tab.clickable && setActiveTab(tab.name)}
              variant={activeTab === tab.name ? "outline" : "ghost"}
              className={`px-3 md:px-4 py-2 border text-xs md:text-sm font-medium transition-colors duration-200 rounded-none ${
                activeTab === tab.name
                  ? "bg-white border-gray-300 text-gray-900"
                  : "bg-transparent border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-transparent"
              } ${!tab.clickable ? "cursor-default" : "cursor-pointer"}`}
            >
              {tab.name}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Select defaultValue="teammates">
            <SelectTrigger className="w-[140px] h-9 text-xs md:text-sm rounded-none border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teammates">Teammates</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center border border-gray-300 bg-white">
            <div className="flex items-center space-x-2 px-3 h-9 border-r border-gray-300">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-xs md:text-sm text-gray-700 whitespace-nowrap">Today</span>
            </div>
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-none hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-none hover:bg-gray-100 border-l border-gray-300">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section - Screenshots */}
      {activeTab === "Screenshots" && (
        <div className="flex flex-col items-center justify-center text-center mt-10 px-4">
          <span className="text-gray-700 text-base md:text-lg font-medium mb-4">maximedoaw204</span>
          <div className="mb-6 relative w-48 h-48 md:w-56 md:h-56">
            <Image
              src="/img26.png"
              alt="Screenshot illustration"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-gray-800 text-base md:text-lg font-semibold mb-2">No screenshots this day</h2>
          <p className="text-gray-600 text-sm max-w-md mb-4">
            Download desktop app to start capturing screenshots every 5 minutes while the timer is running.
          </p>
          <Button className="bg-[#00aaff] hover:bg-[#0090dd] text-white font-medium text-xs md:text-sm px-5 py-2">
            GET SCREENSHOT RECORDING APP
          </Button>
        </div>
      )}

      {/* Content Section - Locations */}
      {activeTab === "Locations" && (
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4">
          {/* Map Section */}
          <Card className="flex-1 border-gray-200 overflow-hidden p-0">
            <div 
              ref={mapContainerRef}
              className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="absolute transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                  width: '200%',
                  height: '200%',
                  left: '-50%',
                  top: '-50%'
                }}
              >
                <Image
                  src="/img27.png"
                  alt="World map showing locations"
                  fill
                  className="object-cover pointer-events-none select-none"
                  draggable={false}
                  priority
                />
              </div>
            </div>
          </Card>

          {/* Sidebar Section */}
          <Card className="w-full lg:w-80 border-gray-200 p-4">
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <Info className="h-4 w-4 text-blue-700" />
              <AlertDescription className="text-blue-700 text-sm">
                <p className="mb-1">No recorded locations for this day.</p>
                <a href="#" className="text-blue-600 font-medium hover:underline">
                  How to track location
                </a>
              </AlertDescription>
            </Alert>

            {/* Members List */}
            <div className="space-y-1">
              {/* Header avec tri dynamique */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-2 px-2">
                <button
                  className="flex items-center gap-1 focus:outline-none"
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  title="Trier la liste"
                >
                  <span>MEMBER</span>
                  <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                </button>
                <span>LAST SEEN ▼</span>
              </div>
              
              {/* Tri de la liste selon l'ordre */}
              {[...teamMembers]
                .slice()
                .sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
                .map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className={`w-8 h-8 ${member.color}`}>
                        <AvatarFallback className={`${member.color} text-white text-sm`}>
                          {member.avatar || member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-800">{member.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{member.lastSeen}</span>
                  </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}