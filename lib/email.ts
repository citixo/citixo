import nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'Citixo01@gmail.com',
    pass: 'clak zhjs olgg vclq' // App password
  }
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error)
  } else {
    console.log('Email service is ready to send messages')
  }
})

// Email templates
export const emailTemplates = {
  signupOTP: (otp: string, firstName: string) => ({
    subject: 'Welcome to Citixo - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.citixoservices.com/images/logo.jpeg" alt="Citixo Logo" style="width: 100px; height: 100px;">
            <h1 style="color: #0095FF; margin: 0; font-size: 28px;">Citixo</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Your Trusted Service Partner</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Welcome ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up with Citixo! To complete your registration and verify your email address, 
            please use the following One-Time Password (OTP):
          </p>
          
          <div style="background-color: #f0f8ff; border: 2px solid #0095FF; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h3 style="color: #0095FF; margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This OTP is valid for <strong>1 minute</strong> and can only be used once. 
            If you didn't request this verification, please ignore this email.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share your OTP with anyone. Citixo will never ask for your OTP via phone or email.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
            If you have any questions, feel free to contact our support team.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 Citixo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Welcome to Citixo!
      
      Hi ${firstName},
      
      Thank you for signing up with Citixo! To complete your registration and verify your email address, 
      please use the following One-Time Password (OTP):
      
      OTP: ${otp}
      
      This OTP is valid for 1 minute and can only be used once.
      
      If you didn't request this verification, please ignore this email.
      
      Best regards,
      The Citixo Team
    `
  })
}

// Send email function
export const sendEmail = async (to: string, subject: string, html: string, text: string) => {
  try {
    const mailOptions = {
      from: {
        name: 'Citixo',
        address: 'Citixo01@gmail.com'
      },
      to,
      subject,
      html,
      text
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string, firstName: string) => {
  const template = emailTemplates.signupOTP(otp, firstName)
  return await sendEmail(email, template.subject, template.html, template.text)
}

export default transporter
