"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Timer, Calendar, BarChart2, Users, Tags, FolderKanban, ChevronsRight, ChevronsLeft, CalendarClock, LayoutDashboard, ChevronDown, ChevronUp, CheckCircle, Clock, Activity, Eye, EyeOff, ChartNoAxesCombined, CalendarCheck2 } from "lucide-react"
import { useState, useEffect } from "react"
import { profileService } from "@/lib/api"
import type { Profile } from "@/lib/api/types"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const reportsSubItems = [
  { href: "#summary", label: "Summary" },
  { href: "#detailed", label: "Detailed" },
  { href: "#weekly", label: "Weekly" },
  { href: "#shared", label: "Shared" },
  { href: "#team", label: "Team" },
  { href: "#attendance", label: "Attendance" },
  { href: "#assignments", label: "Assignments" },
  { href: "#expense", label: "Expense" },
]

const additionalSections = [
  {
    section: "APPROVALS",
    icon: CalendarCheck2,
    href: "/approvals",
    description: "Manage approval requests"
  },
  {
    section: "TIME-OFF", 
    icon: Clock,
    href: "/time-off",
    description: "Time off requests and balance"
  },
  {
    section: "ACTIVITY",
    icon: ChartNoAxesCombined,
    href: "/activity",
    description: "Team activity and tracking"
  }
]

const navigationItems = [
  {
    section: "Track",
    items: [
      { href: "/time-sheet", label: "Timesheet", icon: CalendarClock },
      { href: "/time-tracker", label: "Time Tracker", icon: Timer },
      { href: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    section: "Analyze",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/reports", label: "Reports", icon: BarChart2, hasDropdown: true },
    ],
  },
  {
    section: "Manage",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/teams", label: "Team", icon: Users },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/tags", label: "Tags", icon: Tags },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [showAdditionalSections, setShowAdditionalSections] = useState(false)
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

  // Filter navigation items based on role
  const getFilteredNavigationItems = () => {
    if (isEmployee) {
      // Employee hanya bisa akses: timesheet, time-tracker, calendar, projects
      return [
        {
          section: "Track",
          items: [
            { href: "/time-sheet", label: "Timesheet", icon: CalendarClock },
            { href: "/time-tracker", label: "Time Tracker", icon: Timer },
            { href: "/calendar", label: "Calendar", icon: Calendar },
          ],
        },
        {
          section: "Manage",
          items: [
            { href: "/projects", label: "Projects", icon: FolderKanban },
          ],
        },
      ]
    }
    // Admin dan role lainnya bisa akses semua
    return navigationItems
  }

  // Filter additional sections based on role
  const getFilteredAdditionalSections = () => {
    if (isEmployee) {
      // Employee tidak bisa akses additional sections
      return []
    }
    return additionalSections
  }

  const filteredNavigationItems = getFilteredNavigationItems()
  const filteredAdditionalSections = getFilteredAdditionalSections()

  const isActive = (href: string) => {
    if (href === "/timesheet" && pathname === "/") return true
    return pathname === href || pathname.startsWith(href + "/")
  }

  // Version desktop
  const DesktopSidebar = () => (
    <div className="relative hidden lg:flex">
      <aside
        className={`flex flex-col h-[calc(100vh-60px)] sticky top-[60px] border-r bg-background ${
          isCollapsed ? "w-[60px]" : "w-[230px]"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="relative h-full">
          <ScrollArea className="h-full px-3 py-4">
            <div className="space-y-4">
              {filteredNavigationItems.map((section) => (
                <div key={section.section}>
                  {!isCollapsed && section.section !== "Track" && (
                    <div className="px-3 py-2">
                      <h2 className="mb-2 text-sm font-semibold tracking-tight text-muted-foreground">
                        {section.section}
                      </h2>
                      <Separator />
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href)
                      const isReports = item.hasDropdown

                      return (
                        <div 
                          key={item.href} 
                          className="relative"
                          onMouseEnter={() => isReports && !isCollapsed && setHoveredDropdown(item.label)}
                          onMouseLeave={() => isReports && setHoveredDropdown(null)}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                asChild={!isReports}
                                variant={active ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-2 ${
                                  isCollapsed ? "justify-center px-2" : ""
                                }`}
                                onClick={isReports && isCollapsed ? () => setHoveredDropdown(hoveredDropdown === item.label ? null : item.label) : undefined}
                              >
                                {isReports ? (
                                  <Link href={item.href} className="flex items-center gap-2 w-full">
                                    <Icon className="h-4 w-4" />
                                    {!isCollapsed && (
                                      <>
                                        <span className="uppercase tracking-wide text-xs flex-1 text-left">
                                          {item.label}
                                        </span>
                                        <ChevronDown className={`h-3 w-3 transition-transform ${hoveredDropdown === item.label ? 'rotate-180' : ''}`} />
                                      </>
                                    )}
                                  </Link>
                                ) : (
                                  <Link href={item.href}>
                                    <Icon className="h-4 w-4" />
                                    {!isCollapsed && (
                                      <span className="uppercase tracking-wide text-xs">
                                        {item.label}
                                      </span>
                                    )}
                                  </Link>
                                )}
                              </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right" className="bg-gray-100 text-gray-400">
                                <p>{item.label}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>

                          {/* Dropdown menu for Reports */}
                          {isReports && (
                            <>
                              {/* Desktop dropdown */}
                              {!isCollapsed && hoveredDropdown === item.label && (
                                <div className="absolute left-0 top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50">
                                  <div className="py-1">
                                    {reportsSubItems.map((subItem) => (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className="block px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        onClick={() => setHoveredDropdown(null)}
                                      >
                                        {subItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Collapsed sidebar dropdown */}
                              {isCollapsed && hoveredDropdown === item.label && (
                                <div className="absolute left-full top-0 ml-2 w-48 bg-background border rounded-md shadow-lg z-50">
                                  <div className="py-1">
                                    {reportsSubItems.map((subItem) => (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className="block px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        onClick={() => setHoveredDropdown(null)}
                                      >
                                        {subItem.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Additional Sections Dropdown */}
              <div className="pt-4">
                <Separator className="mb-4" />
                <div className="space-y-1">
                  {filteredAdditionalSections.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-2 ${isCollapsed ? "justify-center px-2" : ""}`}
                        onClick={() => setShowAdditionalSections(!showAdditionalSections)}
                      >
                        {!isCollapsed && (
                          <span className="uppercase tracking-wide text-xs text-muted-foreground/70">
                            {showAdditionalSections ? "SHOW LESS" : "SHOW MORE"}
                          </span>
                        )}
                        {!isCollapsed && (
                          <ChevronDown className={`h-3 w-3 transition-transform ${showAdditionalSections ? 'rotate-180' : ''}`} />
                        )}
                      </Button>

                      {showAdditionalSections && !isCollapsed && (
                    <div className="ml-4 space-y-1 border-l-2 border-muted pl-3">
                      {filteredAdditionalSections.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                          <Tooltip key={item.section}>
                            <TooltipTrigger asChild>
                              <Button
                                asChild
                                variant={active ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2 opacity-80 hover:opacity-100 transition-opacity"
                              >
                                <Link href={item.href}>
                                  <Icon className="h-4 w-4" />
                                  <span className="uppercase tracking-wide text-xs">
                                    {item.section}
                                  </span>
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right" className="bg-gray-100 text-gray-400">
                                <p>{item.section}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        )
                      })}
                    </div>
                      )}

                      {/* Collapsed sidebar additional sections */}
                      {isCollapsed && showAdditionalSections && (
                        <div className="absolute left-full top-0 ml-2 w-48 bg-background border rounded-md shadow-lg z-50">
                          <div className="py-1">
                            {filteredAdditionalSections.map((item) => {
                              const Icon = item.icon
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                  onClick={() => setHoveredDropdown(null)}
                                >
                                  <Icon className="h-4 w-4" />
                                  {item.section}
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          {/* Bouton de toggle positionné de manière fixe */}
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8 p-1 z-10 bg-background border-2"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )

  // Version mobile
  const MobileSidebar = () => (
    <div className="relative lg:hidden">
      <Button
        variant="outline"
        size="icon"
        className="fixed top-1/2 left-0 transform -translate-y-1/2 rounded-r-full w-8 h-8 p-1 z-10 bg-background border-2 border-l-0"
        onClick={() => setIsOpen(true)}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader>
            <VisuallyHidden>
              <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>
          <ScrollArea className="h-full">
            <div className="space-y-4 py-4">
              {navigationItems.map((section) => (
                <div key={section.section}>
                  {section.section !== "Track" && (
                    <div className="px-3 py-2">
                      <h2 className="mb-2 text-sm font-semibold tracking-tight text-muted-foreground">
                        {section.section}
                      </h2>
                      <Separator />
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href)
                      const isReports = item.hasDropdown

                      return (
                        <div key={item.href}>
                          <SheetClose asChild={!isReports}>
                            <Button
                              asChild={!isReports}
                              variant={active ? "secondary" : "ghost"}
                              className="w-full justify-start gap-2"
                              onClick={isReports ? () => setHoveredDropdown(hoveredDropdown === item.label ? null : item.label) : undefined}
                            >
                              {isReports ? (
                                <Link href={item.href} className="flex items-center gap-2 w-full">
                                  <Icon className="h-4 w-4" />
                                  <span className="uppercase tracking-wide text-xs flex-1 text-left">
                                    {item.label}
                                  </span>
                                  <ChevronDown className={`h-3 w-3 transition-transform ${hoveredDropdown === item.label ? 'rotate-180' : ''}`} />
                                </Link>
                              ) : (
                                <Link href={item.href}>
                                  <Icon className="h-4 w-4" />
                                  <span className="uppercase tracking-wide text-xs">
                                    {item.label}
                                  </span>
                                </Link>
                              )}
                            </Button>
                          </SheetClose>
                          
                          {/* Mobile dropdown */}
                          {isReports && hoveredDropdown === item.label && (
                            <div className="mt-1 ml-6 space-y-1">
                              {reportsSubItems.map((subItem) => (
                                <SheetClose asChild key={subItem.href}>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    className="w-full justify-start text-xs"
                                  >
                                    <Link href={subItem.href} className="pl-4">
                                      {subItem.label}
                                    </Link>
                                  </Button>
                                </SheetClose>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Additional Sections for Mobile */}
              <div className="px-3 py-2">
                <Separator className="my-4" />
                {filteredAdditionalSections.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground/70"
                      onClick={() => setShowAdditionalSections(!showAdditionalSections)}
                    >
                      {showAdditionalSections ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="uppercase tracking-wide text-xs">
                        {showAdditionalSections ? "SHOW LESS" : "SHOW MORE"}
                      </span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${showAdditionalSections ? 'rotate-180' : ''}`} />
                    </Button>

                    {showAdditionalSections && (
                      <div className="mt-2 ml-4 space-y-1 border-l-2 border-muted pl-3">
                        {filteredAdditionalSections.map((item) => {
                          const Icon = item.icon
                          const active = isActive(item.href)
                          return (
                            <SheetClose key={item.section} asChild>
                              <Button
                                asChild
                                variant={active ? "secondary" : "ghost"}
                                className="w-full justify-start gap-2 opacity-80 hover:opacity-100 transition-opacity text-xs"
                              >
                                <Link href={item.href}>
                                  <Icon className="h-4 w-4" />
                                  <span className="uppercase tracking-wide">
                                    {item.section}
                                  </span>
                                </Link>
                              </Button>
                            </SheetClose>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
}