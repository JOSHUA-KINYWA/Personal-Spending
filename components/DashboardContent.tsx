'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import TransactionModal from './TransactionModal';
import BudgetTemplateModal from './BudgetTemplateModal';
import BillReminderWidget from './BillReminderWidget';
import ConfirmDialog from './ConfirmDialog';
import CurrencySelector from './CurrencySelector';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteTransaction, updateCurrency } from '@/lib/db-actions';
import type { MonthlyStats, CategorySpending, Transaction, Category, Insight, RecurringTransaction } from '@/lib/types';

interface DashboardContentProps {
  currency: string;
  stats: MonthlyStats;
  categorySpending: CategorySpending[];
  spendingTrend: { month: string; income: number; expenses: number }[];
  insights: Insight[];
  recentTransactions: Transaction[];
  categories: Category[];
  upcomingBills: RecurringTransaction[];
}

export default function DashboardContent({
  currency,
  stats,
  categorySpending,
  spendingTrend,
  insights,
  recentTransactions,
  categories,
  upcomingBills,
}: DashboardContentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetTemplateOpen, setIsBudgetTemplateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteTransaction(id);
          toast.success('Transaction deleted successfully!');
        } catch (error) {
          toast.error('Failed to delete transaction');
        }
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await updateCurrency(newCurrency);
      toast.success(`Currency updated to ${newCurrency}!`);
    } catch (error) {
      toast.error('Failed to update currency');
    }
  };

  return (
    <div className="p-6">
      {/* Header with actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard 📊
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your financial overview for this month</p>
        </div>
        <div className="flex items-center space-x-3">
          <CurrencySelector currentCurrency={currency} onCurrencyChange={handleCurrencyChange} />
          <button
            onClick={() => setIsBudgetTemplateOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
            title="Quick Budget Setup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="hidden sm:inline">Budget</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(stats.income, currency)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(stats.expenses, currency)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💸</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Balance</p>
              <p className={`text-2xl font-bold mt-2 ${stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(stats.balance, currency)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💵</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-gray-400 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.transactionCount}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Reminders */}
      {upcomingBills.length > 0 && (
        <div className="mb-8">
          <BillReminderWidget upcomingBills={upcomingBills} currency={currency} />
        </div>
      )}

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Category Spending */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
          {categorySpending.length > 0 ? (
            <div className="space-y-4">
              {categorySpending.map((cs, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{cs.category.icon}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{cs.category.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(cs.total, currency)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${cs.percentage}%`, backgroundColor: cs.category.color }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cs.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No spending data available for this month.</p>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Smart Insights</h3>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800' :
                  insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' :
                  'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800'
                }`}>
                  <span className="text-xl">{insight.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{insight.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No new insights this month.</p>
          )}
        </div>
      </div>

      {/* Spending Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6-Month Spending Trend</h3>
        {spendingTrend.length > 0 ? (
          <div className="space-y-6">
            {spendingTrend.map((trend, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{trend.month}</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600 dark:text-green-400">↑ {formatCurrency(trend.income, currency)}</span>
                    <span className="text-red-600 dark:text-red-400">↓ {formatCurrency(trend.expenses, currency)}</span>
                  </div>
                </div>
                <div className="flex h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="bg-green-500 dark:bg-green-600"
                    style={{ width: `${(trend.income / (trend.income + trend.expenses)) * 100}%` }}
                  ></div>
                  <div
                    className="bg-red-500 dark:bg-red-600"
                    style={{ width: `${(trend.expenses / (trend.income + trend.expenses)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No spending trend data available.</p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{transaction.category?.icon || '❓'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{transaction.description || transaction.category?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(transaction.transaction_date)}</p>
                  </div>
                </div>
                <span className={`font-bold ${
                  transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No recent transactions. Add one to get started!</p>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        transaction={editingTransaction}
      />

      <BudgetTemplateModal
        isOpen={isBudgetTemplateOpen}
        onClose={() => setIsBudgetTemplateOpen(false)}
        categories={categories}
        currency={currency}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
      />
    </div>
  );
}

