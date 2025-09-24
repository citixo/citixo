import mongoose from 'mongoose'

const CitixoSettingsSchema = new mongoose.Schema({
  settingsId: {
    type: String,
    required: true,
    unique: true,
    default: 'CITIXO_MAIN_SETTINGS'
  },
  
  // General Settings
  general: {
    companyName: {
      type: String,
      default: 'Citixo',
      required: true
    },
    companyEmail: {
      type: String,
      default: 'admin@citixo.com',
      required: true
    },
    supportPhone: {
      type: String,
      default: '1800-123-4567'
    },
    companyAddress: {
      type: String,
      default: '123 Business Park, Pune, Maharashtra 411001'
    },
    companyLogo: {
      publicId: String,
      url: String,
      fileName: String
    },
    website: {
      type: String,
      default: 'https://citixo.com'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'mr']
    }
  },

  // Notification Settings
  notifications: {
    emailNotifications: {
      type: String,
      default: 'admin@citixo.com'
    },
    newBookingNotifications: {
      type: Boolean,
      default: true
    },
    paymentNotifications: {
      type: Boolean,
      default: true
    },
    userRegistrationNotifications: {
      type: Boolean,
      default: false
    },
    systemAlerts: {
      type: Boolean,
      default: true
    },
    emailSettings: {
      smtpHost: String,
      smtpPort: Number,
      smtpUsername: String,
      smtpPassword: String,
      smtpSecure: {
        type: Boolean,
        default: true
      }
    },
    webhookUrl: String
  },

  // Security Settings
  security: {
    passwordMinLength: {
      type: Number,
      default: 8
    },
    requireSpecialChars: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number,
      default: 24 // hours
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 30 // minutes
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    allowedDomains: [{
      type: String
    }],
    ipWhitelist: [{
      type: String
    }]
  },

  // Appearance Settings
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    primaryColor: {
      type: String,
      default: '#0095FF'
    },
    sidebarPosition: {
      type: String,
      enum: ['left', 'right'],
      default: 'left'
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    brandingEnabled: {
      type: Boolean,
      default: true
    },
    customCSS: String
  },

  // Backup Settings
  backup: {
    automaticBackups: {
      type: Boolean,
      default: true
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    retentionPeriod: {
      type: Number,
      default: 30 // days
    },
    lastBackupDate: Date,
    backupLocation: {
      type: String,
      enum: ['local', 'cloud', 'both'],
      default: 'cloud'
    },
    cloudProvider: {
      type: String,
      enum: ['aws', 'gcp', 'azure'],
      default: 'aws'
    }
  },

  // Business Settings
  business: {
    currency: {
      type: String,
      default: 'INR'
    },
    taxRate: {
      type: Number,
      default: 18 // percentage
    },
    businessHours: {
      monday: { start: String, end: String, closed: Boolean },
      tuesday: { start: String, end: String, closed: Boolean },
      wednesday: { start: String, end: String, closed: Boolean },
      thursday: { start: String, end: String, closed: Boolean },
      friday: { start: String, end: String, closed: Boolean },
      saturday: { start: String, end: String, closed: Boolean },
      sunday: { start: String, end: String, closed: Boolean }
    },
    holidays: [{
      date: Date,
      name: String,
      recurring: Boolean
    }],
    serviceRadius: {
      type: Number,
      default: 25 // kilometers
    },
    minimumBookingAmount: {
      type: Number,
      default: 100
    }
  },

  // Integration Settings
  integrations: {
    paymentGateways: {
      razorpay: {
        enabled: Boolean,
        keyId: String,
        keySecret: String
      },
      stripe: {
        enabled: Boolean,
        publicKey: String,
        secretKey: String
      }
    },
    sms: {
      provider: {
        type: String,
        enum: ['twilio', 'aws', 'local']
      },
      apiKey: String,
      apiSecret: String,
      senderId: String
    },
    analytics: {
      googleAnalytics: {
        enabled: Boolean,
        trackingId: String
      },
      mixpanel: {
        enabled: Boolean,
        projectToken: String
      }
    }
  },

  // System Metadata
  version: {
    type: String,
    default: '1.0.0'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
})

// Middleware to update lastUpdated
CitixoSettingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date()
  next()
})

// Default business hours
CitixoSettingsSchema.pre('save', function(next) {
  if (!this.business.businessHours.monday) {
    const defaultHours = { start: '09:00', end: '18:00', closed: false }
    this.business.businessHours = {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: defaultHours,
      sunday: { start: '10:00', end: '16:00', closed: false }
    }
  }
  next()
})

// Static method to get settings
CitixoSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ settingsId: 'CITIXO_MAIN_SETTINGS' })
  if (!settings) {
    settings = new this({ settingsId: 'CITIXO_MAIN_SETTINGS' })
    await settings.save()
  }
  return settings
}

// Instance method to update specific section
CitixoSettingsSchema.methods.updateSection = async function(section: string, data: any) {
  this[section] = { ...this[section], ...data }
  this.lastUpdated = new Date()
  return await this.save()
}

export default mongoose.models.CitixoSettings || mongoose.model('CitixoSettings', CitixoSettingsSchema)
