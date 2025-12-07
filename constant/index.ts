import { BarChart3, Calendar, Clock, CreditCard, DollarSign, FileSpreadsheet, Monitor, Users, Zap } from "lucide-react"

// CarouselItem type definition
export interface CarouselItem {
  id: string
  label: string
  icon: React.ElementType
}

interface Feature {
    id: string
    title: string
    description: string
    icon: React.ElementType
    image: string
  }
  
  export const timekeepingFeatures: Feature[] = [
    {
      id: "timer",
      title: "Timer",
      description: "Track work hours in real time.",
      icon: Clock,
      image: "/img1.jpg",
    },
    {
      id: "timesheet",
      title: "Timesheet",
      description: "Enter time in a weekly timesheet.",
      icon: FileSpreadsheet,
      image: "/img2.jpg",
    },
    {
      id: "calendar",
      title: "Calendar",
      description: "Visually block out and manage time.",
      icon: Calendar,
      image: "/img3.jpg",
    },
    {
      id: "auto-tracker",
      title: "Auto tracker",
      description: "Track apps and websites you use.",
      icon: Zap,
      image: "/img4.jpg",
    },
    {
      id: "kiosk",
      title: "Kiosk",
      description: "Clock in from a shared device.",
      icon: Monitor,
      image: "/img5.jpg",
    },
  ]

  export interface ContentItem {
    id: string
    title: string
    description: string
    image: string
    learnMoreUrl?: string
  }
  
  export interface WhyTimesheeshSectionProps {
    title?: string
    carouselItems?: CarouselItem[]
    contentItems?: ContentItem[]
    defaultActiveItem?: string
    className?: string
  }
  
  export const defaultCarouselItems: CarouselItem[] = [
    { id: "timekeeping", label: "Timekeeping", icon: Clock },
    { id: "budgeting", label: "Budgeting", icon: DollarSign },
    { id: "planning", label: "Planning", icon: Calendar },
    { id: "attendance", label: "Attendance", icon: Users },
    { id: "reporting", label: "Reporting", icon: BarChart3 },
    { id: "payroll", label: "Payroll", icon: CreditCard },
  ]
  
  export const defaultContentItems: ContentItem[] = [
    {
      id: "timekeeping",
      title: "Timekeeping",
      description: "Track time using a timer, clock-in kiosk, or timesheet.",
      image: "/img1.jpg",
      learnMoreUrl: "#",
    },
    {
      id: "budgeting",
      title: "Budgeting",
      description: "Set project budgets and track spending in real-time.",
      image: "/img2.jpg",
      learnMoreUrl: "#",
    },
    {
      id: "planning",
      title: "Planning",
      description: "Plan projects and allocate resources efficiently.",
      image: "/img3.jpg",
      learnMoreUrl: "#",
    },
    {
      id: "attendance",
      title: "Attendance",
      description: "Monitor team attendance and working hours.",
      image: "/img4.jpg",
      learnMoreUrl: "#",
    },
    {
      id: "reporting",
      title: "Reporting",
      description: "Generate detailed reports and analytics.",
      image: "/img5.jpg",
      learnMoreUrl: "#",
    },
    {
      id: "payroll",
      title: "Payroll",
      description: "Streamline payroll processing with accurate time data.",
      image: "/img1.jpg",
      learnMoreUrl: "#",
    },
  ]