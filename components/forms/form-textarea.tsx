import { Field, ErrorMessage } from "formik"
import { cn } from "@/lib/utils"

interface FormTextareaProps {
  name: string
  label: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  className?: string
}

export function FormTextarea({ name, label, placeholder, rows = 3, disabled = false, className }: FormTextareaProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <Field
        as="textarea"
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-vertical",
        )}
      />
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
    </div>
  )
}
