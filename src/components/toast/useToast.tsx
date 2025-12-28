import toast from 'react-hot-toast'
import CustomToast from './CustomToast'

type ToastVariant = 'success' | 'error' | 'info' | 'loading'

interface ShowToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  actionLabel?: string
  onAction?: () => void
}

export function useToast() {
  const show = ({
    title,
    description,
    variant = 'info',
    actionLabel,
    onAction,
  }: ShowToastOptions) => {
    toast.custom((t) => (
      <CustomToast
        t={t}
        title={title}
        description={description}
        variant={variant}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    ), {
      position: "bottom-right"
    })
  }

  return { show }
}
