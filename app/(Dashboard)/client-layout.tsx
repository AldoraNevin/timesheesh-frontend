"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import type React from "react"
import { useState } from "react"


interface ClientLayoutProps {
  children: React.ReactNode
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <>
      <Header/>
      <div className="flex bg-[#f2f6f8]">
        <Sidebar/>
        <main id="layout-main" className="flex-1 min-h-[750px] lg:ml-0">
          <div className="px-4 lg:px-6">{children}</div>
        </main>
      </div>
    </>
  )
}

export default ClientLayout