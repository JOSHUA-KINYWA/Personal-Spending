'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import TransactionModal from './TransactionModal';
import BudgetTemplateModal from './BudgetTemplateModal';
import CurrencySelector from './CurrencySelector';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteTransaction, updateCurrency } from '@/lib/db-actions';
import type { MonthlyStats, CategorySpending, Transaction, Category, Insight } from '@/lib/types';

interface DashboardClientProps {
  userData: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  currency: string;
  stats: MonthlyStats;
  categorySpending: CategorySpending[];
  spendingTrend: { month: string; income: number; expenses: number }[];
  insights: Insight[];
  recentTransactions: Transaction[];
  categories: Category[];
}

export default function DashboardClient({
  userData,
  currency,
  stats,
  categorySpending,
  spendingTrend,
  insights,
  recentTransactions,
  categories,
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetTemplateOpen, setIsBudgetTemplateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        alert('Failed to delete transaction');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      await updateCurrency(newCurrency);
    } catch (error) {
      alert('Failed to update currency');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">💰 FinFlow</h1>
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard" className="px-3 py-2 text-indigo-600 font-semibold border-b-2 border-indigo-600">
                  Dashboard
                </Link>
                <Link href="/transactions" className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Transactions
                </Link>
                <Link href="/recurring" className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Recurring
                </Link>
                <Link href="/categories" className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Categories
                </Link>
                <Link href="/goals" className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Goals
                </Link>
                <Link href="/analytics" className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Analytics
                </Link>
                <Link href="/reports" className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Reports
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CurrencySelector currentCurrency={currency} onCurrencyChange={handleCurrencyChange} />
              <button
                onClick={() => setIsBudgetTemplateOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                title="Quick Budget Setup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="hidden lg:inline">Budget</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                + Add Transaction
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData.firstName || 'User'}! 👋
          </h2>
          <p className="text-gray-600 mt-1">Here's your financial overview for this month</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">Income</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.income, currency)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.expenses, currency)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">Balance</p>
                <p className={`text-2xl font-bold mt-2 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.balance, currency)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.transactionCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Spending by Category */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h3>
              {categorySpending.length > 0 ? (
                <div className="space-y-4">
                  {categorySpending.map((cs) => (
                    <div key={cs.category.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{cs.category.icon}</span>
                          <span className="font-semibold text-gray-900">{cs.category.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(cs.total, currency)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cs.percentage}%`,
                              backgroundColor: cs.category.color,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[45px] text-right">
                          {cs.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">📊 No spending data yet</p>
                  <p className="text-sm">Add your first expense to see insights</p>
                </div>
              )}
            </div>

            {/* Spending Trend */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">6-Month Trend</h3>
              {spendingTrend.some(t => t.income > 0 || t.expenses > 0) ? (
                <div className="space-y-4">
                  {spendingTrend.map((trend, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{trend.month}</span>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600">↑ {formatCurrency(trend.income, currency)}</span>
                          <span className="text-red-600">↓ {formatCurrency(trend.expenses, currency)}</span>
                        </div>
                      </div>
                      <div className="flex h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${Math.max(0, (trend.income / Math.max(trend.income, trend.expenses, 1)) * 100)}%`,
                          }}
                        />
                        <div
                          className="bg-red-500"
                          style={{
                            width: `${Math.max(0, (trend.expenses / Math.max(trend.income, trend.expenses, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">📈 No trend data yet</p>
                  <p className="text-sm">Add transactions to see trends</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Insights */}
            {insights.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Insights</h3>
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.type === 'warning'
                          ? 'bg-red-50 border-red-500'
                          : insight.type === 'success'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-xl">{insight.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{insight.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                <Link href="/transactions" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                  View All →
                </Link>
              </div>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className="text-lg">{transaction.category?.icon || '📌'}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {transaction.description || transaction.category?.name || 'Transaction'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.transaction_date)}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">📝 No transactions yet</p>
                  <p className="text-sm">Click "Add Transaction" to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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
    </div>
  );
}

