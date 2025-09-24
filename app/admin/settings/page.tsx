"use client"

import { useState, useEffect } from "react"
import { Save, Upload, Bell, Shield, Globe, Palette, Database, Download, RefreshCw, AlertTriangle } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { toast, ToastContainer } from "react-toastify"

interface Settings {
  general: {
    companyName: string
    companyEmail: string
    supportPhone: string
    companyAddress: string
    companyLogo?: {
      publicId: string
      url: string
      fileName: string
    }
    website: string
    timezone: string
    language: string
  }
  notifications: {
    emailNotifications: string
    newBookingNotifications: boolean
    paymentNotifications: boolean
    userRegistrationNotifications: boolean
    systemAlerts: boolean
  }
  security: {
    passwordMinLength: number
    requireSpecialChars: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
    twoFactorEnabled: boolean
  }
  appearance: {
    theme: string
    primaryColor: string
    sidebarPosition: string
    compactMode: boolean
  }
  backup: {
    automaticBackups: boolean
    backupFrequency: string
    retentionPeriod: number
    lastBackupDate?: string
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [logoImages, setLogoImages] = useState<any[]>([])
  const [exportLoading, setExportLoading] = useState<string | null>(null)

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "backup", name: "Backup", icon: Database },
  ]

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
        
        // Set logo images if available
        if (result.data.general.companyLogo && Object.keys(result.data.general.companyLogo).length > 0) {
          setLogoImages([{
            publicId: result.data.general.companyLogo.publicId,
            url: result.data.general.companyLogo.url,
            fileName: result.data.general.companyLogo.fileName,
            width: 200,
            height: 200,
            size: 0
          }])
        }
      } else {
        toast.error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (section?: string) => {
    if (!settings) return

    try {
      setSaving(true)
      
      let apiUrl = '/api/settings'
      let updateData: any = {}
      
      if (section) {
        // Use section-specific API endpoints
        apiUrl = `/api/settings/${section}`
        updateData = settings[section as keyof Settings]
        
        // Handle logo update for general settings
        if (section === 'general') {
          if (logoImages.length > 0) {
            updateData.companyLogo = logoImages[0]
          } else {
            // If no logo images, remove the logo
            updateData.companyLogo = null
          }
        }
        
        // Handle password change for security settings
        if (section === 'security' && passwords.new) {
          updateData = {
            ...updateData,
            currentPassword: passwords.current,
            newPassword: passwords.new,
            confirmPassword: passwords.confirm,
            adminPassword: 'Password@123' // Demo admin password
          }
        }
      } else {
        // Global save - use main settings API
        updateData = { data: settings }
      }

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || `${section ? section.charAt(0).toUpperCase() + section.slice(1) : 'All'} settings saved successfully`)
        
        // Clear password fields after successful change
        if (section === 'security' && passwords.new) {
          setPasswords({ current: '', new: '', confirm: '' })
        }
        
        // Refresh settings to get latest data
        await fetchSettings()
      } else {
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section as keyof Settings],
        [field]: value
      }
    }))
  }

  const handleExport = async (type: string) => {
    try {
      setExportLoading(type)
      const response = await fetch(`/api/export?type=${type}&format=csv`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `citixo_${type}_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success(`${type} data exported successfully`)
      } else {
        toast.error(`Failed to export ${type} data`)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    } finally {
      setExportLoading(null)
    }
  }

  const handleBackup = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_backup' })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Backup created successfully')
        await fetchSettings() // Refresh to show new backup date
      } else {
        toast.error('Failed to create backup')
      }
    } catch (error) {
      console.error('Backup error:', error)
      toast.error('Backup failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black text-xl flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Settings Not Available</h2>
          <p className="text-gray-900 mb-4">Unable to load application settings</p>
          <button 
            onClick={fetchSettings}
            className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Settings</h1>
        <p className="text-gray-900 mt-2">Manage your application settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-4 border border-[#2D3748]">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#0095FF] text-white"
                      : "text-gray-900 hover:bg-slate-100 hover:text-black"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-100 rounded-xl p-6 border border-[#2D3748]">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-black">General Settings</h2>
                  <button
                    onClick={() => saveSettings('general')}
                    disabled={saving}
                    className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      value={settings.general.companyName}
                      onChange={(e) => handleInputChange('general', 'companyName', e.target.value)}
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Company Email</label>
                    <input
                      type="email"
                      value={settings.general.companyEmail}
                      onChange={(e) => handleInputChange('general', 'companyEmail', e.target.value)}
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Support Phone</label>
                    <input
                      type="tel"
                      value={settings.general.supportPhone}
                      onChange={(e) => handleInputChange('general', 'supportPhone', e.target.value)}
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Company Address</label>
                    <textarea
                      rows={3}
                      value={settings.general.companyAddress}
                      onChange={(e) => handleInputChange('general', 'companyAddress', e.target.value)}
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Company Logo</label>
                    <div className="bg-white border border-[#2D3748] rounded-lg p-4">
                      <ImageUpload
                        onImagesChange={(images) => {
                          setLogoImages(images)
                          // Auto-update logo in settings when images change
                          if (settings) {
                            handleInputChange('general', 'companyLogo', images.length > 0 ? images[0] : null)
                          }
                        }}
                        existingImages={logoImages}
                        maxImages={1}
                        folder="company"
                        transformations={{
                          width: 200,
                          height: 200,
                          crop: 'fill',
                          quality: 'auto'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-black">Notification Settings</h2>
                  <button
                    onClick={() => saveSettings('notifications')}
                    disabled={saving}
                    className="bg-[#0095FF] hover:bg-[#0080E6] text-black px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <h3 className="text-black font-medium">New Booking Notifications</h3>
                      <p className="text-gray-900 text-sm">Get notified when new bookings are made</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.newBookingNotifications}
                      onChange={(e) => handleInputChange('notifications', 'newBookingNotifications', e.target.checked)}
                      className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <h3 className="text-black font-medium">Payment Notifications</h3>
                      <p className="text-gray-900 text-sm">Get notified about payment updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.paymentNotifications}
                      onChange={(e) => handleInputChange('notifications', 'paymentNotifications', e.target.checked)}
                      className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <h3 className="text-black font-medium">User Registration</h3>
                      <p className="text-gray-900 text-sm">Get notified when new users register</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.userRegistrationNotifications}
                      onChange={(e) => handleInputChange('notifications', 'userRegistrationNotifications', e.target.checked)}
                      className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <h3 className="text-black font-medium">System Alerts</h3>
                      <p className="text-gray-900 text-sm">Get notified about system issues</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                      className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Email Notifications</label>
                  <input
                    type="email"
                    value={settings.notifications.emailNotifications}
                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.value)}
                    className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="Enter notification email"
                  />
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black">Security Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="border-t border-[#2D3748] pt-6">
                  <h3 className="text-black font-semibold mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <h4 className="text-black font-medium">Enable 2FA</h4>
                      <p className="text-gray-900 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#0095FF] bg-[#111B22] border-[#2D3748] rounded focus:ring-[#0095FF]"
                    />
                  </div>
                </div>

                <div className="border-t border-[#2D3748] pt-6">
                  <h3 className="text-black font-semibold mb-4">Session Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#111B22] rounded-lg">
                      <div>
                        <h4 className="text-black font-medium">Current Session</h4>
                        <p className="text-gray-400 text-sm">Chrome on Windows • Active now</p>
                      </div>
                      <span className="text-green-500 text-sm">Active</span>
                    </div>
                    <button className="text-red-500 hover:text-red-400 text-sm">Sign out all other sessions</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black">Appearance Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Theme</label>
                    <select className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]">
                      <option value="dark">Dark Theme</option>
                      <option value="light">Light Theme</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        defaultValue="#0095FF"
                        className="w-12 h-10 bg-white border border-[#2D3748] rounded-lg"
                      />
                      <input
                        type="text"
                        defaultValue="#0095FF"
                        className="flex-1 bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Sidebar Position</label>
                    <select className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]">
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <h3 className="text-black font-medium">Compact Mode</h3>
                      <p className="text-gray-900 text-sm">Reduce spacing and padding</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-black">Backup & Data</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Automatic Backups</h3>
                    <p className="text-gray-900 text-sm mb-4">Automatically backup your data at regular intervals</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">Enable automatic backups</span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">Backup Frequency</label>
                    <select className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="border-t border-[#2D3748] pt-6">
                    <h3 className="text-white font-semibold mb-4">Manual Backup</h3>
                    <div className="flex items-center space-x-4">
                      <button className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Create Backup Now
                      </button>
                      <span className="text-gray-400 text-sm">Last backup: 2 hours ago</span>
                    </div>
                  </div>

                  <div className="border-t border-[#2D3748] pt-6">
                    <h3 className="text-white font-semibold mb-4">Data Export</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-white border border-[#2D3748] text-black px-4 py-3 rounded-lg hover:bg-[#2D3748] transition-colors text-left">
                        Export Users Data
                      </button>
                      <button className="w-full bg-white border border-[#2D3748] text-black px-4 py-3 rounded-lg hover:bg-[#2D3748] transition-colors text-left">
                        Export Bookings Data
                      </button>
                      <button className="w-full bg-white border border-[#2D3748] text-black px-4 py-3 rounded-lg hover:bg-[#2D3748] transition-colors text-left">
                        Export Services Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Save Button */}
            {/* <div className="flex justify-end pt-6 border-t border-[#2D3748]">
              <button 
                onClick={() => saveSettings()}
                disabled={saving}
                className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}
