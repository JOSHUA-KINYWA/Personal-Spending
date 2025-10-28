# Email Configuration Guide for FinFlow

## Overview
FinFlow uses Nodemailer to send email notifications for bill reminders and financial reports.

## Required Environment Variables

Add these to your `.env.local` file and Vercel environment variables:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Setup Instructions

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Step Verification**
   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification
   - Enable it if not already enabled

2. **Create an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "FinFlow"
   - Click "Generate"
   - Copy the 16-character password

3. **Add to Environment Variables**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

### Option 2: Other Email Providers

#### **SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### **Mailgun**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-username
SMTP_PASSWORD=your-mailgun-smtp-password
```

#### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

## Vercel Deployment

### Adding Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `NEXT_PUBLIC_APP_URL`
4. Select all environments (Production, Preview, Development)
5. Click "Save"

## Email Features

### 1. Bill Reminders
- Automatically sends reminders based on `reminder_days_before` setting
- Emails are sent for upcoming recurring bills
- Includes bill details, amount, and due date

### 2. Financial Reports
- Send monthly/yearly reports via email
- Includes summary statistics and insights
- PDF attachment (optional)

### 3. Budget Alerts
- Notifies when spending exceeds budget thresholds
- Warns at 80% and 100% of budget

## Testing Email Configuration

Use the test function to verify your email setup:

```typescript
import { testEmailConfiguration } from '@/lib/email-actions';

const success = await testEmailConfiguration();
console.log('Email test:', success ? 'Passed' : 'Failed');
```

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Double-check your SMTP credentials
   - For Gmail, ensure you're using an App Password, not your regular password
   - Verify 2-Step Verification is enabled

2. **"Connection refused"**
   - Check `SMTP_HOST` and `SMTP_PORT` are correct
   - Verify firewall/network isn't blocking SMTP ports
   - Try `SMTP_SECURE=true` with port `465` (for SSL)

3. **"Emails not sending"**
   - Check environment variables are set correctly
   - Review server logs for error messages
   - Verify email provider allows SMTP access

### Production Recommendations

For production, consider using:
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- **Amazon SES** - Very low cost, highly scalable
- **Resend** - Developer-friendly, modern API

## Security Notes

⚠️ **Important Security Tips:**
- Never commit `.env.local` to version control
- Use App Passwords instead of your main email password
- Rotate SMTP credentials periodically
- Use environment-specific credentials
- Monitor email sending logs for unusual activity

## Support

For issues or questions:
- WhatsApp: +254 758 036936
- Email: Contact via the app
- Developer: Eng. Kinywa - Kinywa Tech Solutions

