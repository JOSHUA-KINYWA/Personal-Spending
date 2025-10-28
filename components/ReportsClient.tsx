'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { generateReportData, getMonthDateRange, getYearDateRange, getCurrentMonthRange, getCurrentYearRange } from '@/lib/report-utils';
import { generatePDFReport } from '@/lib/pdf-utils';
import type { Transaction, Category } from '@/lib/types';

interface ReportsClientProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  userEmail: string;
}

export default function ReportsClient({ transactions, categories, currency, userEmail }: ReportsClientProps) {
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isGenerating, setIsGenerating] = useState(false);

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.transaction_date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear());
  }

  // Generate report data
  const reportData = useMemo(() => {
    const dateRange = reportType === 'monthly'
      ? getMonthDateRange(selectedYear, selectedMonth)
      : getYearDateRange(selectedYear);

    return generateReportData(
      transactions,
      dateRange.startDate,
      dateRange.endDate,
      reportType,
      categories
    );
  }, [transactions, categories, reportType, selectedYear, selectedMonth]);

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    try {
      generatePDFReport(reportData, currency);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    toast.success(`Email report feature coming soon! Will be sent to ${userEmail}`);
    // This would integrate with an email service like Resend, SendGrid, etc.
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Generate comprehensive PDF reports for your records</p>
      </div>

        {/* Report Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Report Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Report Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setReportType('monthly')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    reportType === 'monthly'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  📅 Monthly
                </button>
                <button
                  onClick={() => setReportType('yearly')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    reportType === 'yearly'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  📆 Yearly
                </button>
              </div>
            </div>

            {/* Year Selection */}
            <div>
              <label htmlFor="year" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Month Selection (only for monthly) */}
            {reportType === 'monthly' && (
              <div>
                <label htmlFor="month" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Month
                </label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{isGenerating ? 'Generating...' : 'Generate PDF Report'}</span>
            </button>

            <button
              onClick={handleEmailReport}
              className="flex-1 min-w-[200px] px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email Report</span>
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Report Preview</h3>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(reportData.totalIncome, currency)}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(reportData.totalExpenses, currency)}</p>
            </div>

            <div className={`bg-gradient-to-br rounded-xl p-6 border ${
              reportData.netBalance >= 0
                ? 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800'
                : 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800'
            }`}>
              <p className={`text-sm font-semibold mb-2 ${
                reportData.netBalance >= 0
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}>Net Balance</p>
              <p className={`text-2xl font-bold ${
                reportData.netBalance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>{formatCurrency(reportData.netBalance, currency)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Transactions</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{reportData.transactionCount}</p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Savings Rate</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{reportData.savingsRate.toFixed(1)}%</p>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Average Daily Expense</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(reportData.avgDailyExpense, currency)}</p>
            </div>
          </div>

          {/* Top Categories */}
          {reportData.categoryBreakdown.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Spending Categories</h4>
              <div className="space-y-3">
                {reportData.categoryBreakdown.slice(0, 5).map((cat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(cat.amount, currency)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{cat.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>📄 What's included in the PDF report:</strong> Complete financial summary, category breakdown,
              monthly trends, top expenses, payment methods analysis, and detailed transaction data.
            </p>
          </div>
        </div>
    </div>
  );
}

