'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import type { RecurringTransaction } from '@/lib/types';

interface BillReminderWidgetProps {
  upcomingBills: RecurringTransaction[];
  currency?: string;
}

export default function BillReminderWidget({
  upcomingBills,
  currency = 'KES',
}: BillReminderWidgetProps) {
  if (upcomingBills.length === 0) {
    return null;
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const daysDifference = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference;
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil === 0) return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
    if (daysUntil === 1) return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300';
    return 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300';
  };

  const getUrgencyIcon = (daysUntil: number) => {
    if (daysUntil === 0) return '🚨';
    if (daysUntil === 1) return '⚠️';
    return '🔔';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <span>🔔</span>
          <span>Upcoming Bills</span>
        </h3>
        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm font-semibold rounded-full">
          {upcomingBills.length} Due Soon
        </span>
      </div>

      <div className="space-y-3">
        {upcomingBills.map((bill) => {
          const daysUntil = getDaysUntilDue(bill.next_due_date);
          const urgencyColor = getUrgencyColor(daysUntil);
          const urgencyIcon = getUrgencyIcon(daysUntil);

          return (
            <div
              key={bill.id}
              className={`p-4 rounded-lg border-2 ${urgencyColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-2xl">{urgencyIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{bill.category?.icon || '💳'}</span>
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {bill.description}
                      </p>
                    </div>
                    {bill.merchant && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {bill.merchant}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Due: {formatDate(bill.next_due_date)}
                      {daysUntil === 0 && ' (Today!)'}
                      {daysUntil === 1 && ' (Tomorrow)'}
                      {daysUntil > 1 && ` (in ${daysUntil} days)`}
                    </p>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className={`text-lg font-bold ${
                    bill.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {bill.type === 'expense' ? '-' : '+'}{formatCurrency(bill.amount, currency)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    {bill.frequency}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a
          href="/recurring"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm flex items-center space-x-1 transition-colors"
        >
          <span>Manage Recurring Transactions</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

