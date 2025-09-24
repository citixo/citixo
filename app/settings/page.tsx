"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Bell, Lock, Globe, Moon, Sun, Smartphone, Mail, Shield } from "lucide-react"

interface UserData {
  email: string
  name: string
  loginTime: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setNotifications(settings.notifications ?? true)
        setEmailNotifications(settings.emailNotifications ?? true)
        setSmsNotifications(settings.smsNotifications ?? false)
        setDarkMode(settings.darkMode ?? true)
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  const saveSettings = () => {
    const settings = {
      notifications,
      emailNotifications,
      smsNotifications,
      darkMode,
    }
    localStorage.setItem('userSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#111B22] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to access settings</p>
          <Link href="/login" className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111B22] text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-[#1A2332] rounded-xl p-6 border border-[#2D3748]">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-[#0095FF]" />
              <span>Account Security</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Change Password</p>
                    <p className="text-gray-400 text-sm">Update your account password</p>
                  </div>
                </div>
                <button className="bg-[#374151] hover:bg-[#4B5563] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Email Address</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <button className="bg-[#374151] hover:bg-[#4B5563] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Update
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Phone Number</p>
                    <p className="text-gray-400 text-sm">Add phone number for security</p>
                  </div>
                </div>
                <button className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-[#1A2332] rounded-xl p-6 border border-[#2D3748]">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Bell className="w-6 h-6 text-[#0095FF]" />
              <span>Notifications</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-gray-400 text-sm">Receive notifications about your bookings</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-[#0095FF]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-gray-400 text-sm">Get updates via email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-[#0095FF]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div>
                  <p className="text-white font-medium">SMS Notifications</p>
                  <p className="text-gray-400 text-sm">Receive SMS updates (charges may apply)</p>
                </div>
                <button
                  onClick={() => setSmsNotifications(!smsNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    smsNotifications ? 'bg-[#0095FF]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      smsNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-[#1A2332] rounded-xl p-6 border border-[#2D3748]">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Globe className="w-6 h-6 text-[#0095FF]" />
              <span>Preferences</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div className="flex items-center space-x-3">
                  {darkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-gray-400 text-sm">Use dark theme for better viewing</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-[#0095FF]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Language</p>
                    <p className="text-gray-400 text-sm">English (US)</p>
                  </div>
                </div>
                <button className="bg-[#374151] hover:bg-[#4B5563] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Location</p>
                    <p className="text-gray-400 text-sm">Pune, Maharashtra</p>
                  </div>
                </div>
                <button className="bg-[#374151] hover:bg-[#4B5563] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#1A2332] rounded-xl p-6 border border-red-500/20">
            <h2 className="text-xl font-bold mb-6 text-red-400">Danger Zone</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">Delete Account</p>
                  <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 