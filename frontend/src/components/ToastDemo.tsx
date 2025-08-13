import React from 'react'
import { Button } from './ui/button'
import { useToastActions } from './ui/toast-provider'

export const ToastDemo: React.FC = () => {
  const { success, error, warning, info } = useToastActions()

  const handleSuccessToast = () => {
    success(
      'Campaign Created Successfully!', 
      'Your campaign is now live and accepting applications from influencers.',
      {
        action: {
          label: 'View Campaign',
          onClick: () => console.log('Navigate to campaign')
        }
      }
    )
  }

  const handleErrorToast = () => {
    error(
      'Upload Failed', 
      'Failed to upload brand assets. Please check your internet connection and try again.',
      {
        duration: 8000,
        action: {
          label: 'Retry Upload',
          onClick: () => console.log('Retry upload')
        }
      }
    )
  }

  const handleWarningToast = () => {
    warning(
      'Campaign Budget Low', 
      'Your campaign budget is running low. Consider increasing it to reach more influencers.',
      {
        action: {
          label: 'Add Budget',
          onClick: () => console.log('Add budget')
        }
      }
    )
  }

  const handleInfoToast = () => {
    info(
      'New Feature Available', 
      'You can now track real-time analytics for your campaigns. Check out the analytics dashboard!',
      {
        action: {
          label: 'View Analytics',
          onClick: () => console.log('Navigate to analytics')
        }
      }
    )
  }

  const handleMultipleToasts = () => {
    setTimeout(() => success('First toast', 'This is the first notification'), 100)
    setTimeout(() => info('Second toast', 'This is the second notification'), 600)
    setTimeout(() => warning('Third toast', 'This is the third notification'), 1100)
    setTimeout(() => error('Fourth toast', 'This is the fourth notification'), 1600)
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Toast Notifications Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          onClick={handleSuccessToast}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Show Success Toast
        </Button>
        
        <Button 
          onClick={handleErrorToast}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Show Error Toast
        </Button>
        
        <Button 
          onClick={handleWarningToast}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          Show Warning Toast
        </Button>
        
        <Button 
          onClick={handleInfoToast}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Show Info Toast
        </Button>
      </div>

      <div className="mt-6">
        <Button 
          onClick={handleMultipleToasts}
          variant="outline"
          className="w-full"
        >
          Show Multiple Toasts (Stack Demo)
        </Button>
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h3 className="font-semibold text-slate-900 mb-2">Usage Example:</h3>
        <pre className="text-sm text-slate-700 bg-white p-3 rounded border overflow-x-auto">
{`import { useToastActions } from './ui/toast-provider'

const { success, error, warning, info } = useToastActions()

// Simple toast
success('Campaign Created!', 'Your campaign is now live.')

// Toast with action button
success('Files Uploaded!', '5 brand assets added.', {
  action: {
    label: 'View Files',
    onClick: () => console.log('Navigate to files')
  }
})

// Custom duration
error('Upload Failed', 'Please try again.', {
  duration: 8000
})`}
        </pre>
      </div>
    </div>
  )
}