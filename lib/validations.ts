import * as Yup from "yup"

export const loginSchema = Yup.object({
  email: Yup.string().required("Email is required").email("Invalid email format"),
  password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  remember: Yup.boolean(),
})

export const userSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: Yup.string().required("Email is required").email("Invalid email format"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^[+]?[1-9][\d]{0,15}$/, "Invalid phone number"),
  address: Yup.string().required("Address is required").min(10, "Address must be at least 10 characters"),
  status: Yup.string().required("Status is required").oneOf(["Active", "Inactive", "Blocked"], "Invalid status"),
})

export const serviceSchema = Yup.object({
  name: Yup.string()
    .required("Service name is required")
    .min(3, "Service name must be at least 3 characters")
    .max(100, "Service name must be less than 100 characters"),
  category: Yup.string().required("Category is required"),
  price: Yup.string()
    .required("Price is required")
    .matches(/^₹?\d+/, "Invalid price format"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  status: Yup.string().required("Status is required").oneOf(["Active", "Inactive"], "Invalid status"),
})

export const planSchema = Yup.object({
  name: Yup.string()
    .required("Plan name is required")
    .min(3, "Plan name must be at least 3 characters")
    .max(50, "Plan name must be less than 50 characters"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be positive")
    .max(100000, "Price must be less than ₹1,00,000"),
  period: Yup.string().required("Period is required").oneOf(["month", "year"], "Invalid period"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be less than 200 characters"),
  features: Yup.array().of(Yup.string().required("Feature cannot be empty")).min(1, "At least one feature is required"),
  status: Yup.string().required("Status is required").oneOf(["Active", "Inactive"], "Invalid status"),
  popular: Yup.boolean(),
})

export const contactSchema = Yup.object({
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: Yup.string().required("Email is required").email("Invalid email format"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^[+]?[1-9][\d]{0,15}$/, "Invalid phone number"),
  message: Yup.string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
})
