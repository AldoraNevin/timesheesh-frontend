'use client'

import React from 'react'
import { useTimesheetToast } from './toast-context'
import { ToastItem } from './toast-item'

type Position =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'

const positionClasses: Record<Position, string> = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
}

export function Toaster({ position = 'bottom-right' as Position }) {
  const { toasts, dismiss } = useTimesheetToast()

  return (
    <div
      className={[
        'pointer-events-none fixed z-50',
        positionClasses[position],
      ].join(' ')}
    >
      <div className="flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  )
}
