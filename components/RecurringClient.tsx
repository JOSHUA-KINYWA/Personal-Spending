'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import RecurringTransactionModal from './RecurringTransactionModal';
import ConfirmDialog from './ConfirmDialog';
import { deleteRecurringTransaction, toggleRecurringTransaction, generateDueRecurringTransactions } from '@/lib/db-actions';
import type { Category, RecurringTransaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface RecurringClientProps {
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
}

export default function RecurringClient({ recurringTransactions: initialRecurring, categories }: RecurringClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringTransaction | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
  });

  function handleAdd() {
    setSelectedRecurring(undefined);
    setIsModalOpen(true);
  }

  function handleEdit(recurring: RecurringTransaction) {
    setSelectedRecurring(recurring);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Recurring Transaction',
      message: 'Are you sure you want to delete this recurring transaction? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteRecurringTransaction(id);
          toast.success('Recurring transaction deleted successfully!');
        } catch (error) {
          console.error('Failed to delete recurring transaction:', error);
          toast.error('Failed to delete recurring transaction');
        }
      },
    });
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    try {
      await toggleRecurringTransaction(id, !currentStatus);
      toast.success(`Recurring transaction ${currentStatus ? 'paused' : 'activated'}!`);
    } catch (error) {
      console.error('Failed to toggle recurring transaction:', error);
      toast.error('Failed to toggle recurring transaction');
    }
  }

  async function handleGenerateNow() {
    setConfirmDialog({
      isOpen: true,
      title: 'Generate Due Transactions',
      message: 'This will generate all due recurring transactions now. Continue?',
      variant: 'info',
      onConfirm: async () => {
        setIsGenerating(true);
        try {
          const result = await generateDueRecurringTransactions();
          toast.success(`Successfully generated ${result.generated} transaction(s)!`);
        } catch (error) {
          console.error('Failed to generate transactions:', error);
          toast.error('Failed to generate transactions');
        } finally {
          setIsGenerating(false);
        }
      },
    });
  }

  const activeRecurring = initialRecurring.filter(r => r.is_active);
  const inactiveRecurring = initialRecurring.filter(r => !r.is_active);

  function getFrequencyBadge(frequency: string) {
    const badges = {
      daily: { icon: '📅', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Daily' },
      weekly: { icon: '📆', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', label: 'Weekly' },
      monthly: { icon: '📆', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', label: 'Monthly' },
      yearly: { icon: '📆', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Yearly' },
    };
    const badge = badges[frequency as keyof typeof badges] || badges.monthly;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔄 Recurring Transactions</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your recurring bills and income</p>
      </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleAdd}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Recurring Transaction</span>
          </button>

          <button
            onClick={handleGenerateNow}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isGenerating ? 'Generating...' : 'Generate Due Now'}</span>
          </button>
        </div>

        {/* Active Recurring Transactions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">✅ Active ({activeRecurring.length})</h3>
          {activeRecurring.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Recurring Transactions</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Set up recurring transactions for bills, subscriptions, or regular income
              </p>
              <button
                onClick={handleAdd}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                Add Your First Recurring Transaction
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeRecurring.map((recurring) => (
                <div key={recurring.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{recurring.category?.icon || '📌'}</span>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{recurring.description}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{recurring.category?.name}</p>
                    </div>
                    <span className={`text-2xl font-bold ${recurring.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Frequency:</span>
                      {getFrequencyBadge(recurring.frequency)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Next Due:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{new Date(recurring.next_due_date).toLocaleDateString()}</span>
                    </div>
                    {recurring.end_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Ends:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{new Date(recurring.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {recurring.auto_mark_paid && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 dark:text-green-400">✅</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Auto-generated</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEdit(recurring)}
                      className="flex-1 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(recurring.id, recurring.is_active)}
                      className="flex-1 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-semibold rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleDelete(recurring.id)}
                      className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Recurring Transactions */}
        {inactiveRecurring.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⏸️ Paused ({inactiveRecurring.length})</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inactiveRecurring.map((recurring) => (
                <div key={recurring.id} className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow p-6 opacity-60 hover:opacity-100 transition-opacity border border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{recurring.category?.icon || '📌'}</span>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{recurring.description}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{recurring.category?.name}</p>
                    </div>
                    <span className={`text-2xl font-bold ${recurring.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => handleToggle(recurring.id, recurring.is_active)}
                      className="flex-1 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleDelete(recurring.id)}
                      className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Modal */}
      <RecurringTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        recurring={selectedRecurring}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </div>
  );
}

