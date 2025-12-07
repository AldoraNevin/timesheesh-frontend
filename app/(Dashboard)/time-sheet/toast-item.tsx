'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { TimesheetToast, ToastVariant } from './toast-context'

const variantClasses: Record<ToastVariant, string> = {
  default:
    'border-gray-200',
  success:
    'border-green-200',
  warning:
    'border-yellow-200',
  destructive:
    'border-red-200',
}

const accentClasses: Record<ToastVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  destructive: 'bg-red-500',
}

export function ToastItem({
  toast,
  onDismiss,
}: {
  toast: TimesheetToast
  onDismiss: (id: string) => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const v = toast.variant || 'default'

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'pointer-events-auto relative flex w-[92vw] max-w-[360px] items-start gap-3 rounded-md border bg-white p-3 shadow-lg ring-1 ring-black/5',
        'transition-all duration-200 ease-out',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        variantClasses[v],
      ].join(' ')}
    >
      <div className={['absolute left-0 top-0 h-full w-1 rounded-l-md', accentClasses[v]].join(' ')} />
      <div className="ml-1 flex min-w-0 flex-1">
        <div className="min-w-0">
          {toast.title ? (
            <div className="mb-0.5 text-sm font-medium text-gray-900">{toast.title}</div>
          ) : null}
          {toast.description ? (
            <div className="text-xs text-gray-600">{toast.description}</div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={() => onDismiss(toast.id)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
