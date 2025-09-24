import type React from "react"
import { Field, ErrorMessage } from "formik"
import { cn } from "@/lib/utils"

interface FormInputProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
}

export function FormInput({
  name,
  label,
  type = "text",
  placeholder,
  disabled = false,
  className,
  icon,
}: FormInputProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">{icon}</div>}
        <Field
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-10",
          )}
        />
      </div>
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-400" />
    </div>
  )
}
