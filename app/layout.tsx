import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Citixo - Professional Home Services",
  description: "Your trusted partner for home cleaning, repairs, and maintenance services",
    generator: 'v0.app',
    icons: {
      icon: "/images/logo.jpeg", // relative to /public
    }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
     <body suppressHydrationWarning className="min-h-screen bg-white md:px-[7rem] lg:px-[7rem] text-gray-900">

        <Header />
        <main>{children}</main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  )
}
