import { Field, ErrorMessage } from "formik"
import { cn } from "@/lib/utils"

interface FormSelectProps {
  name: string
  label: string
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function FormSelect({ name, label, options, placeholder, disabled = false, className }: FormSelectProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <Field
        as="select"
        id={name}
        name={name}
        disabled={disabled}
        className={cn(
          "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
    </div>
  )
}
