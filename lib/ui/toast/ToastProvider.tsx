import { ChildrenProp } from '@lib/ui/props'
import { createContextHook } from '@lib/ui/state/createContextHook'
import { createContext, useCallback, useEffect, useRef, useState } from 'react'

import { ToastItem } from './ToastItem'
import { ToastStatus } from './ToastStatus'

type Toast = {
  id: number
  message: string
  duration: number
  status: ToastStatus
}

type AddToastParams = Pick<Toast, 'message'> &
  Partial<Pick<Toast, 'duration' | 'status'>>

type ToastContextState = {
  addToast: (params: AddToastParams) => void
}

const toastDefaultDuration = 3000

const ToastContext = createContext<ToastContextState | undefined>(undefined)

export const ToastProvider = ({ children }: ChildrenProp) => {
  const [toast, setToast] = useState<Toast | null>(null)
  const nextToastId = useRef(0)

  // Runs once the keyed ToastItem has committed, which is also when its ring
  // animation starts — so both dismissal paths share one start signal. Timing
  // from `addToast` instead would subtract the handler-to-commit gap and cut
  // the ring off short.
  useEffect(() => {
    if (!toast) return

    const timeout = setTimeout(() => {
      setToast(null)
    }, toast.duration)

    return () => {
      clearTimeout(timeout)
    }
  }, [toast])

  const addToast: ToastContextState['addToast'] = useCallback(
    ({ message, duration = toastDefaultDuration, status = 'success' }) => {
      setToast({
        id: nextToastId.current++,
        message,
        duration,
        status,
      })
    },
    []
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toast ? (
        // Keyed by id so a toast raised while another is still on screen
        // remounts and restarts its ring instead of inheriting the old one.
        <ToastItem
          key={toast.id}
          duration={toast.duration}
          value={toast.status}
        >
          {toast.message}
        </ToastItem>
      ) : null}
    </ToastContext.Provider>
  )
}

export const useToast = createContextHook(ToastContext, 'ToastContext')
