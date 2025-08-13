import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const toastStyles = {
  success: {
    bg: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    progressBar: 'bg-green-500'
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    progressBar: 'bg-red-500'
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    progressBar: 'bg-yellow-500'
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    progressBar: 'bg-blue-500'
  }
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

export const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  const styles = toastStyles[toast.type]
  const Icon = toastIcons[toast.type]
  const duration = toast.duration || 5000

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss timer
    let progressInterval: NodeJS.Timeout
    let dismissTimeout: NodeJS.Timeout

    const startTimer = () => {
      const startTime = Date.now()
      
      progressInterval = setInterval(() => {
        if (!isPaused) {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, duration - elapsed)
          const progressPercent = (remaining / duration) * 100
          setProgress(progressPercent)
          
          if (remaining <= 0) {
            clearInterval(progressInterval)
            handleClose()
          }
        }
      }, 50)
    }

    startTimer()

    return () => {
      clearInterval(progressInterval)
      clearTimeout(dismissTimeout)
    }
  }, [duration, isPaused])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(toast.id), 300)
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-out transform
        ${styles.bg}
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : isExiting 
            ? 'translate-x-full opacity-0 scale-95'
            : '-translate-x-full opacity-0 scale-95'
        }
        hover:shadow-xl hover:scale-105
        max-w-sm w-full
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
        <div 
          className={`h-full transition-all duration-75 ease-linear ${styles.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg}`}>
            <Icon className={`w-5 h-5 ${styles.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.titleColor} leading-5`}>
              {toast.title}
            </h4>
            {toast.message && (
              <p className={`mt-1 text-sm ${styles.messageColor} leading-4`}>
                {toast.message}
              </p>
            )}

            {/* Action Button */}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className={`
                    text-sm font-medium underline decoration-2 underline-offset-2 
                    transition-colors duration-200 hover:no-underline
                    ${toast.type === 'success' ? 'text-green-700 hover:text-green-800' : ''}
                    ${toast.type === 'error' ? 'text-red-700 hover:text-red-800' : ''}
                    ${toast.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' : ''}
                    ${toast.type === 'info' ? 'text-blue-700 hover:text-blue-800' : ''}
                  `}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
              transition-colors duration-200 hover:bg-gray-200
              ${styles.iconColor} hover:${styles.iconColor}
            `}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div 
        className={`
          absolute inset-0 opacity-20 pointer-events-none rounded-lg
          ${toast.type === 'success' ? 'bg-gradient-to-r from-green-400 to-emerald-400' : ''}
          ${toast.type === 'error' ? 'bg-gradient-to-r from-red-400 to-rose-400' : ''}
          ${toast.type === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : ''}
          ${toast.type === 'info' ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : ''}
        `}
      />
    </div>
  )
}