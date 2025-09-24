# OTP Email Verification Implementation

This document describes the OTP (One-Time Password) email verification system implemented for the Citixo signup process.

## Overview

The OTP system adds an extra layer of security to the user registration process by requiring users to verify their email address with a 6-digit code sent via email.

## Features

- ✅ 6-digit OTP generation
- ✅ Email sending via Gmail SMTP
- ✅ 1-minute OTP expiration
- ✅ Real-time countdown timer
- ✅ OTP resend functionality with cooldown
- ✅ Rate limiting (30-second cooldown between requests)
- ✅ Automatic cleanup of expired OTPs
- ✅ Maximum 3 attempts per OTP
- ✅ Beautiful HTML email templates

## Implementation Details

### 1. Database Schema (`Citixootps` Collection)

```javascript
{
  email: String (required, indexed)
  otp: String (required, 6 digits)
  purpose: String (enum: 'signup', 'login', 'password_reset', 'email_verification')
  isUsed: Boolean (default: false)
  attempts: Number (default: 0, max: 3)
  expiresAt: Date (required, TTL index)
  createdAt: Date (default: Date.now)
}
```

### 2. API Endpoints

#### Send OTP
- **Endpoint**: `POST /api/auth/send-otp`
- **Body**: `{ email: string, firstName: string }`
- **Response**: `{ success: boolean, message: string, expiresIn: number }`

#### Verify OTP
- **Endpoint**: `POST /api/auth/verify-otp`
- **Body**: `{ email: string, otp: string }`
- **Response**: `{ success: boolean, message: string }`

### 3. Email Configuration

- **SMTP Host**: smtp.gmail.com
- **Port**: 587
- **Security**: TLS
- **From**: Citixo01@gmail.com
- **App Password**: clak zhjs olgg vclq

### 4. Frontend Flow

1. **Form Step**: User fills out registration form
2. **OTP Step**: User enters 6-digit OTP received via email
3. **Verification**: OTP is verified and account is created
4. **Redirect**: User is redirected to login page

## Security Features

- **Rate Limiting**: 30-second cooldown between OTP requests
- **Attempt Limiting**: Maximum 3 attempts per OTP
- **Time Expiration**: OTPs expire after 1 minute
- **Automatic Cleanup**: Expired OTPs are automatically removed
- **One-time Use**: Each OTP can only be used once

## File Structure

```
lib/
├── models/
│   └── Citixootps.ts          # OTP database model
├── email.ts                   # Email service configuration
app/
├── api/auth/
│   ├── send-otp/
│   │   └── route.ts           # Send OTP API endpoint
│   └── verify-otp/
│       └── route.ts           # Verify OTP API endpoint
└── signup/
    └── page.tsx               # Updated signup page with OTP flow
```

## Usage

### 1. User Registration Flow

1. User visits `/signup`
2. Fills out the registration form
3. Clicks "Send OTP"
4. Receives email with 6-digit code
5. Enters OTP in the verification step
6. Clicks "Verify & Create Account"
7. Account is created and user is redirected to login

### 2. OTP Email Template

The email includes:
- Professional Citixo branding
- Large, easy-to-read OTP code
- Security warnings
- Expiration information
- Responsive design

### 3. Error Handling

- Invalid email format
- Network errors
- OTP expiration
- Maximum attempts exceeded
- Rate limiting violations

## Testing

To test the OTP system:

1. Run the development server: `npm run dev`
2. Visit `/signup`
3. Fill out the form with a valid email
4. Check the email inbox for the OTP
5. Enter the OTP to complete registration

## Environment Variables

Make sure to set up the following environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Dependencies

- `nodemailer`: Email sending functionality
- `@types/nodemailer`: TypeScript types for nodemailer
- `mongoose`: MongoDB ODM
- `next`: React framework

## Troubleshooting

### Common Issues

1. **Email not sending**: Check Gmail app password and SMTP settings
2. **OTP not generating**: Verify MongoDB connection
3. **Timer not working**: Check React state management
4. **Rate limiting**: Wait 30 seconds between requests

### Debug Mode

Enable debug logging by adding console.log statements in the API routes.

## Future Enhancements

- SMS OTP support
- Voice call OTP
- Multi-language email templates
- Advanced rate limiting
- OTP analytics and monitoring
- Custom OTP length configuration

## Security Considerations

- Never log OTP values in production
- Use HTTPS for all API calls
- Implement proper rate limiting
- Monitor for suspicious activity
- Regularly rotate email credentials
- Use environment variables for sensitive data

## Support

For issues or questions regarding the OTP implementation, please contact the development team.
