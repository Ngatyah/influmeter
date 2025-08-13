import React, { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ToastComponent, Toast } from './toast'

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience hooks for different toast types
export const useToastActions = () => {
  const { addToast } = useToast()

  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'success',
      title,
      message,
      duration: 4000,
      ...options
    })
  }, [addToast])

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'error',
      title,
      message,
      duration: 6000,
      ...options
    })
  }, [addToast])

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'warning',
      title,
      message,
      duration: 5000,
      ...options
    })
  }, [addToast])

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options
    })
  }, [addToast])

  return { success, error, warning, info }
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const newToast: Toast = { ...toast, id }
    
    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts]
      // Keep only the most recent toasts
      return updatedToasts.slice(0, maxToasts)
    })
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }, [])

  const contextValue: ToastContextValue = {
    addToast,
    removeToast,
    toasts
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  // Create portal to render toasts at the root level
  if (typeof document === 'undefined') return null

  const toastRoot = document.getElementById('toast-root') || document.body

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[9999] pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="flex flex-col space-y-2 pointer-events-auto">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>,
    toastRoot
  )
}

// Alternative positioning options - you can create different providers
export const ToastProviderBottomRight: React.FC<ToastProviderProps> = ({ children, maxToasts = 5 }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const newToast: Toast = { ...toast, id }
    setToasts(prevToasts => [newToast, ...prevToasts].slice(0, maxToasts))
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }, [])

  const contextValue: ToastContextValue = { addToast, removeToast, toasts }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
          <div className="flex flex-col-reverse space-y-reverse space-y-2 pointer-events-auto">
            {toasts.map(toast => (
              <ToastComponent key={toast.id} toast={toast} onClose={removeToast} />
            ))}
          </div>
        </div>,
        document.getElementById('toast-root') || document.body
      )}
    </ToastContext.Provider>
  )
}