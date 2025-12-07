'use client'

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive'

export type TimesheetToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  duration?: number // ms
}

type Ctx = {
  toasts: TimesheetToast[]
  show: (t: Omit<TimesheetToast, 'id'>) => { id: string }
  dismiss: (id: string) => void
  clearAll: () => void
}

const TimesheetToastContext = createContext<Ctx | null>(null)

function genId() {
  return Math.random().toString(36).slice(2)
}

export function TimesheetToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<TimesheetToast[]>([])
  const timeouts = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: string) => {
    // Clear timer if exists
    const t = timeouts.current.get(id)
    if (t) {
      window.clearTimeout(t)
      timeouts.current.delete(id)
    }
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    timeouts.current.forEach((t) => window.clearTimeout(t))
    timeouts.current.clear()
    setToasts([])
  }, [])

  const show: Ctx['show'] = useCallback(
    (t) => {
      const id = genId()
      const next: TimesheetToast = {
        id,
        variant: 'default',
        duration: 3500,
        ...t,
      }
      setToasts((prev) => [next, ...prev])

      // Auto-dismiss
      const timeoutId = window.setTimeout(() => {
        dismiss(id)
      }, next.duration)
      timeouts.current.set(id, timeoutId)

      return { id }
    },
    [dismiss]
  )

  const value = useMemo<Ctx>(
    () => ({
      toasts,
      show,
      dismiss,
      clearAll,
    }),
    [toasts, show, dismiss, clearAll]
  )

  return (
    <TimesheetToastContext.Provider value={value}>
      {children}
    </TimesheetToastContext.Provider>
  )
}

export function useTimesheetToast() {
  const ctx = useContext(TimesheetToastContext)
  if (!ctx) {
    throw new Error('useTimesheetToast must be used inside TimesheetToastProvider')
  }
  return ctx
}
