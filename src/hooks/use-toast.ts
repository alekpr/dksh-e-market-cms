import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
}

interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: []
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

export function useToast() {
  const [state, setState] = useState<ToastState>(initialState)

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = genId()
    const newToast = { ...toast, id }
    
    setState((prevState) => ({
      ...prevState,
      toasts: [...prevState.toasts, newToast]
    }))

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        toasts: prevState.toasts.filter((t) => t.id !== id)
      }))
    }, 5000)

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      toasts: prevState.toasts.filter((t) => t.id !== id)
    }))
  }, [])

  return {
    toasts: state.toasts,
    toast: addToast,
    dismiss: removeToast
  }
}
