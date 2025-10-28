import nodemailer from 'nodemailer';
import type { RecurringTransaction } from './types';
import { formatCurrency } from './currencies';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email credentials not configured. Email not sent.');
      return false;
    }

    await transporter.sendMail({
      from: `"FinFlow" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email Templates
export function generateBillReminderEmail(
  bill: RecurringTransaction,
  daysUntilDue: number,
  currency: string
): string {
  const urgencyColor = daysUntilDue <= 3 ? '#ef4444' : '#f59e0b';
  const urgencyText = daysUntilDue === 0 ? 'DUE TODAY' : `Due in ${daysUntilDue} days`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bill Reminder - ${bill.description}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    💰 FinFlow
                  </h1>
                  <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">
                    Bill Reminder
                  </p>
                </td>
              </tr>
              
              <!-- Urgency Banner -->
              <tr>
                <td style="padding: 0 40px;">
                  <div style="background-color: ${urgencyColor}; color: #ffffff; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0; font-weight: bold; font-size: 18px;">
                    ⚠️ ${urgencyText.toUpperCase()}
                  </div>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 0 40px 40px;">
                  <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px;">
                    ${bill.description}
                  </h2>
                  
                  <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: bold; text-align: right;">
                          ${formatCurrency(bill.amount, currency)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">
                          Day ${bill.recurring_day} of each month
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Frequency:</td>
                        <td style="padding: 8px 0; color: #1f2937; text-align: right;">
                          ${bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
                    ${daysUntilDue === 0 
                      ? 'This bill is due today. Please make sure to pay it on time to avoid late fees.' 
                      : `This is a reminder that your ${bill.description} bill is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}.`
                    }
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://finflow.vercel.app'}/recurring" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View in FinFlow
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    © ${new Date().getFullYear()} FinFlow by Kinywa Tech Solutions
                  </p>
                  <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                    Designed & Developed by Eng. Kinywa - Software Developer
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateReportEmail(
  reportType: string,
  period: string,
  summary: {
    income: number;
    expenses: number;
    netBalance: number;
  },
  currency: string,
  pdfBuffer?: Buffer
): string {
  const balanceColor = summary.netBalance >= 0 ? '#10b981' : '#ef4444';
  const balanceIcon = summary.netBalance >= 0 ? '✅' : '⚠️';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Financial Report - ${period}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    💰 FinFlow
                  </h1>
                  <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">
                    Your ${reportType} Report
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 10px;">
                    Financial Summary
                  </h2>
                  <p style="color: #6b7280; margin: 0 0 30px; font-size: 16px;">
                    ${period}
                  </p>
                  
                  <!-- Summary Cards -->
                  <table style="width: 100%; margin-bottom: 30px;">
                    <tr>
                      <td style="width: 33%; padding: 20px; background-color: #d1fae5; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">Total Income</p>
                        <p style="margin: 8px 0 0; color: #047857; font-size: 24px; font-weight: bold;">
                          ${formatCurrency(summary.income, currency)}
                        </p>
                      </td>
                      <td style="width: 4%;"></td>
                      <td style="width: 33%; padding: 20px; background-color: #fee2e2; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">Total Expenses</p>
                        <p style="margin: 8px 0 0; color: #dc2626; font-size: 24px; font-weight: bold;">
                          ${formatCurrency(summary.expenses, currency)}
                        </p>
                      </td>
                      <td style="width: 4%;"></td>
                      <td style="width: 33%; padding: 20px; background-color: ${summary.netBalance >= 0 ? '#dbeafe' : '#fee2e2'}; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; color: ${summary.netBalance >= 0 ? '#1e40af' : '#991b1b'}; font-size: 14px; font-weight: 600;">Net Balance</p>
                        <p style="margin: 8px 0 0; color: ${balanceColor}; font-size: 24px; font-weight: bold;">
                          ${balanceIcon} ${formatCurrency(summary.netBalance, currency)}
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 30px;">
                    <p style="margin: 0; color: #4b5563; line-height: 1.6;">
                      ${summary.netBalance >= 0 
                        ? '🎉 Great job! You\'re maintaining a positive balance. Keep up the good work managing your finances.' 
                        : '⚠️ Your expenses exceeded your income this period. Consider reviewing your spending and looking for areas to cut back.'
                      }
                    </p>
                  </div>
                  
                  ${pdfBuffer ? `
                  <p style="color: #4b5563; margin-bottom: 20px;">
                    Your detailed financial report is attached as a PDF. This includes:
                  </p>
                  <ul style="color: #6b7280; margin: 0 0 20px 20px; line-height: 1.8;">
                    <li>Detailed transaction breakdown</li>
                    <li>Category-wise spending analysis</li>
                    <li>Visual charts and graphs</li>
                    <li>Budget performance metrics</li>
                  </ul>
                  ` : ''}
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://finflow.vercel.app'}/reports" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Full Report
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    © ${new Date().getFullYear()} FinFlow by Kinywa Tech Solutions
                  </p>
                  <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                    Designed & Developed by Eng. Kinywa - Software Developer
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

