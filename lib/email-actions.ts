'use server';

import { currentUser } from '@clerk/nextjs/server';
import { sendEmail, generateBillReminderEmail, generateReportEmail } from './email';
import { getUpcomingBillReminders, getOrCreateProfile } from './db-actions';
import type { RecurringTransaction } from './types';

export async function sendBillReminderEmails(): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const profile = await getOrCreateProfile();
    const upcomingBills = await getUpcomingBillReminders();
    
    let sent = 0;
    let failed = 0;

    for (const bill of upcomingBills) {
      const daysUntilDue = Math.ceil(
        (new Date(bill.next_due_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const emailHtml = generateBillReminderEmail(bill, daysUntilDue, profile?.currency || 'KES');
      
      const success = await sendEmail({
        to: user.emailAddresses[0]?.emailAddress || '',
        subject: `Bill Reminder: ${bill.description} - Due ${daysUntilDue === 0 ? 'Today' : `in ${daysUntilDue} days`}`,
        html: emailHtml,
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { success: true, sent, failed };
  } catch (error) {
    console.error('Error sending bill reminder emails:', error);
    return { success: false, sent: 0, failed: 0 };
  }
}

export async function sendReportEmail(
  reportType: string,
  period: string,
  summary: {
    income: number;
    expenses: number;
    netBalance: number;
  }
): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const profile = await getOrCreateProfile();
    const currency = profile?.currency || 'KES';

    const emailHtml = generateReportEmail(reportType, period, summary, currency);
    
    return await sendEmail({
      to: user.emailAddresses[0]?.emailAddress || '',
      subject: `Your ${reportType} Financial Report - ${period}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending report email:', error);
    return false;
  }
}

export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return await sendEmail({
      to: user.emailAddresses[0]?.emailAddress || '',
      subject: 'FinFlow Email Test',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #667eea;">🎉 Email Configuration Successful!</h1>
          <p style="color: #4b5563; font-size: 16px;">
            Your FinFlow email notifications are now set up and working correctly.
          </p>
          <p style="color: #6b7280; margin-top: 20px;">
            You'll now receive bill reminders and financial reports directly to your inbox.
          </p>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return false;
  }
}

