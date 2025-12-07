import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, FileText, Users, MoreHorizontal, Clock, Puzzle } from "lucide-react"
import { UserAvatar } from "../ui/user-avatar"
import { useRouter } from "next/navigation"
import { profileService } from "@/lib/api"
import type { Profile } from "@/lib/api/types"

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const router = useRouter()

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfile()
        setCurrentUser(profile)
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        // Keep currentUser as null if fetch fails
      }
    }

    fetchProfile()
  }, [])

  // Helper untuk generate initials
  const getInitials = (name?: string, email?: string): string => {
    if (name) {
      const parts = name.split(" ")
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const userInitials = currentUser 
    ? getInitials(currentUser.full_name, currentUser.email)
    : "MA" // Fallback
  const userName = currentUser?.full_name || currentUser?.email?.split("@")[0]
  const userRole = currentUser?.role
  return (
    <header className="w-full bg-background border-b border-timesheesh-border fixed z-20">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-500 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold text-timesheesh-dark">timesheesh</span>
          </div>
          <span className="text-timesheesh-gray text-sm">{userName}</span>
          
          {/* Three dots dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-timesheesh-gray hover:bg-timesheesh-light-gray p-1 h-auto">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-56 bg-popover border border-timesheesh-border shadow-lg rounded-lg p-0"
              sideOffset={8}
            >
              <div className="py-2">
                <DropdownMenuItem 
                className="flex items-center space-x-3 px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer"
                onClick={() => router.push("/workspace-settings")}
                >
                  <Settings className="w-4 h-4 text-timesheesh-gray" />
                  <span className="text-sm text-timesheesh-dark">Workspace settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center space-x-3 px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <FileText className="w-4 h-4 text-timesheesh-gray" />
                  <span className="text-sm text-timesheesh-dark">Subscription</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center space-x-3 px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <Users className="w-4 h-4 text-timesheesh-gray" />
                  <span className="text-sm text-timesheesh-dark">Manage workspaces</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">

          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-timesheesh-light-gray flex items-center justify-center">
               <Puzzle className="w-5 h-5 rounded-full bg-warning"/>
            </div>
          </div>

          {/* Help Dropdown */}
          <DropdownMenu open={isHelpDropdownOpen} onOpenChange={setIsHelpDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-6 h-6 rounded-full bg-timesheesh-light-gray flex items-center justify-center hover:bg-timesheesh-border p-0 min-w-0"
              >
                <span className="text-xs text-timesheesh-gray">?</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-popover border border-timesheesh-border shadow-lg rounded-lg p-0"
              sideOffset={8}
            >
              <div className="py-2">
                <DropdownMenuItem className="flex items-center px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <span className="text-sm text-timesheesh-dark">Help center</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <span className="text-sm text-timesheesh-dark">Tutorials</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <span className="text-sm text-timesheesh-dark">Contact support</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                <UserAvatar name={userInitials} className="cursor-pointer" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-popover border border-timesheesh-border shadow-lg rounded-lg p-0"
              sideOffset={8}
            >
              <div className="p-4 border-b border-timesheesh-border">
                <div className="flex items-center space-x-3">
                  <UserAvatar name={userInitials} />
                  <div>
                    <p className="text-sm font-medium text-timesheesh-dark">{userName}</p>
                    <p className="text-xs text-timesheesh-gray">{userRole}</p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <DropdownMenuItem 
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer"
                  onClick={() => router.push("/workspace-settings")}
                >
                  <Settings className="w-4 h-4 text-timesheesh-gray" />
                  <span className="text-sm text-timesheesh-dark">Workspace settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center space-x-3 px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <FileText className="w-4 h-4 text-timesheesh-gray" />
                  <span className="text-sm text-timesheesh-dark">Subscription</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center space-x-3 px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <Users className="w-4 h-4 text-timesheesh-gray" />
                  <span className="text-sm text-timesheesh-dark">Manage workspaces</span>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-timesheesh-border" />
              
              <div className="py-2">
                <DropdownMenuItem className="flex items-center space-x-3 px-4 py-3 hover:bg-timesheesh-light-gray cursor-pointer">
                  <span className="text-sm text-timesheesh-dark">Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}