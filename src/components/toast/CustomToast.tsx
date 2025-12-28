import toast from 'react-hot-toast'
import { toastIcons, toastVariantStyles } from "./toastIcons"

type ToastVariant = 'success' | 'error' | 'info' | 'loading'

interface CustomToastProps {
  t: any
  title: string
  description?: string
  variant?: ToastVariant
  actionLabel?: string
  onAction?: () => void
}

export default function CustomToast({
  t,
  title,
  description,
  variant = 'info',
  actionLabel,
  onAction,
}: CustomToastProps) {
  const Icon = toastIcons[variant]
  
  return (
    <div
      className={`${
        t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
      } max-w-md w-full  dark:ring-gray-700 bg-background shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Icon
              className={`h-6 w-6 mt-0.5 ${toastVariantStyles[variant]} ${
                variant === "loading" ? "animate-spin" : ""
              }`}
            />
          </div>

          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-l border-gray-200 dark:border-gray-700">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 text-sm dark:text-indigo-700 text-indigo-600 hover:bg-indigo-50"
          >
            {actionLabel}
          </button>
        )}

        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  )
}