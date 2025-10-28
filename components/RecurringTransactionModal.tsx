'use client';

import { useState, useEffect } from 'react';
import { createRecurringTransaction, updateRecurringTransaction } from '@/lib/db-actions';
import type { Category, RecurringTransaction } from '@/lib/types';

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  recurring?: RecurringTransaction;
}

export default function RecurringTransactionModal({
  isOpen,
  onClose,
  categories,
  recurring,
}: RecurringTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>(recurring?.type || 'expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recurring) {
      setType(recurring.type);
    }
  }, [recurring]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      if (recurring) {
        await updateRecurringTransaction(recurring.id, formData);
      } else {
        await createRecurringTransaction(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recurring transaction');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredCategories = categories.filter(
    cat => cat.type === type || cat.type === 'both'
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {recurring ? '✏️ Edit Recurring Transaction' : '🔄 Add Recurring Transaction'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    type === 'expense'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  💸 Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    type === 'income'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  💰 Income
                </button>
              </div>
              <input type="hidden" name="type" value={type} />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-bold">
                  $
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  defaultValue={recurring?.amount}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                defaultValue={recurring?.description}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Monthly Netflix Subscription"
              />
            </div>

            {/* Category & Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  defaultValue={recurring?.category_id || ''}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="payment_method" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  defaultValue={recurring?.payment_method || ''}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select method</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="Credit Card">💳 Credit Card</option>
                  <option value="Debit Card">💳 Debit Card</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="Mobile Payment">📱 Mobile Payment</option>
                  <option value="Other">🔸 Other</option>
                </select>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label htmlFor="frequency" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                defaultValue={recurring?.frequency || 'monthly'}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">📅 Daily</option>
                <option value="weekly">📆 Weekly</option>
                <option value="monthly">📆 Monthly</option>
                <option value="yearly">📆 Yearly</option>
              </select>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  defaultValue={recurring?.start_date || today}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  defaultValue={recurring?.end_date || ''}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Auto Mark Paid */}
            <div className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <input
                type="checkbox"
                id="auto_mark_paid"
                name="auto_mark_paid"
                value="true"
                defaultChecked={recurring?.auto_mark_paid || false}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="auto_mark_paid" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                ✅ Automatically mark generated transactions as paid
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : recurring ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

