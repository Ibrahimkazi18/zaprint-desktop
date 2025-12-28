import {
  CheckCircle,
  XCircle,
  Info,
  Loader2,
} from "lucide-react"

export const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  loading: Loader2,
}

// components/toast/toastStyles.ts
export const toastVariantStyles = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  loading: "text-gray-600 dark:text-gray-400",
}
