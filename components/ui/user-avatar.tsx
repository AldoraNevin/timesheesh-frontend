import * as React from "react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  className?: string
}

export function UserAvatar({ name, className }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full bg-success text-success-foreground text-sm font-medium bg-green-500 text-white",
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}