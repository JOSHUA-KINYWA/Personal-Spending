'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import TransactionModal from './TransactionModal';
import ConfirmDialog from './ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteTransaction } from '@/lib/db-actions';
import { exportToCSV, exportToExcel, downloadCSV, downloadExcel, generateFilename, exportSummaryToCSV } from '@/lib/export-utils';
import type { Transaction, Category } from '@/lib/types';

interface TransactionsClientProps {
  transactions: Transaction[];
  categories: Category[];
  currency?: string;
}

export default function TransactionsClient({ transactions, categories, currency = 'KES' }: TransactionsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMerchant, setFilterMerchant] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'merchant'>('none');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
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

  // Get unique merchants
  const uniqueMerchants = useMemo(() => {
    const merchants = transactions
      .map(t => t.merchant)
      .filter(Boolean) as string[];
    return [...new Set(merchants)].sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(search) ||
        t.merchant?.toLowerCase().includes(search) ||
        t.category?.name.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category_id === filterCategory);
    }

    // Merchant filter
    if (filterMerchant !== 'all') {
      filtered = filtered.filter(t => t.merchant === filterMerchant);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.transaction_date.localeCompare(a.transaction_date);
      } else {
        return Number(b.amount) - Number(a.amount);
      }
    });

    return filtered;
  }, [transactions, searchTerm, filterType, filterCategory, filterMerchant, sortBy]);

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

  // Export handlers
  const getExportTransactions = () => {
    let exportData = [...filteredTransactions];
    
    // Apply date range filter if specified
    if (exportStartDate) {
      exportData = exportData.filter(t => t.transaction_date >= exportStartDate);
    }
    if (exportEndDate) {
      exportData = exportData.filter(t => t.transaction_date <= exportEndDate);
    }
    
    return exportData;
  };

  const handleExportCSV = () => {
    const exportData = getExportTransactions();
    if (exportData.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    
    const csv = exportToCSV(exportData, currency);
    const filename = generateFilename('csv', exportStartDate, exportEndDate);
    downloadCSV(csv, filename);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    const exportData = getExportTransactions();
    if (exportData.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    
    const excel = exportToExcel(exportData, currency);
    const filename = generateFilename('excel', exportStartDate, exportEndDate);
    downloadExcel(excel, filename);
    setShowExportMenu(false);
  };

  const handleExportSummary = () => {
    const exportData = getExportTransactions();
    if (exportData.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    
    const csv = exportSummaryToCSV(exportData, currency);
    const filename = generateFilename('csv', exportStartDate, exportEndDate).replace('.csv', '_summary.csv');
    downloadCSV(csv, filename);
    setShowExportMenu(false);
  };

  // Group by merchant if needed
  const groupedByMerchant = useMemo(() => {
    if (groupBy !== 'merchant') return null;

    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      const key = t.merchant || 'Unknown Merchant';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [groupBy, filteredTransactions]);

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">All Transactions</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all your income and expenses</p>
        </div>
        <div className="flex items-center space-x-4">
              {/* Export Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export</span>
                </button>

                {showExportMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Export Transactions</h3>
                        
                        {/* Date Range Filters */}
                        <div className="space-y-3 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Start Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={exportStartDate}
                              onChange={(e) => setExportStartDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              End Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={exportEndDate}
                              onChange={(e) => setExportEndDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          {(exportStartDate || exportEndDate) && (
                            <button
                              onClick={() => {
                                setExportStartDate('');
                                setExportEndDate('');
                              }}
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                            >
                              Clear dates
                            </button>
                          )}
                        </div>

                        {/* Export Options */}
                        <div className="space-y-2">
                          <button
                            onClick={handleExportCSV}
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Export as CSV</span>
                            </div>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Most compatible</span>
                          </button>

                          <button
                            onClick={handleExportExcel}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Export as Excel</span>
                            </div>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">For spreadsheets</span>
                          </button>

                          <button
                            onClick={handleExportSummary}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Export with Summary</span>
                            </div>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">With totals</span>
                          </button>
                        </div>

                        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <p className="text-xs text-indigo-700 dark:text-indigo-300">
                            <strong>💡 Tip:</strong> Exports include split transaction details, perfect for tax records!
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                + Add Transaction
              </button>
            </div>
          </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Income</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Net</p>
            <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Merchant Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Merchant</label>
              <select
                value={filterMerchant}
                onChange={(e) => setFilterMerchant(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Merchants</option>
                {uniqueMerchants.map(merchant => (
                  <option key={merchant} value={merchant}>
                    {merchant}
                  </option>
                ))}
              </select>
            </div>

            {/* Group By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'none' | 'merchant')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="none">No Grouping</option>
                <option value="merchant">By Merchant</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="date">Date (Newest)</option>
                <option value="amount">Amount (Highest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <>
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.is_split ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">✂️</span>
                              <span className="text-sm font-medium text-indigo-600">
                                Split Transaction
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{transaction.category?.icon || '📌'}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {transaction.category?.name || 'Uncategorized'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {transaction.description || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {transaction.payment_method || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {/* Split Details Row */}
                      {transaction.is_split && transaction.splits && transaction.splits.length > 0 && (
                        <tr key={`${transaction.id}-splits`} className="bg-indigo-50">
                          <td colSpan={6} className="px-6 py-3">
                            <div className="flex items-start space-x-2 text-xs">
                              <span className="font-semibold text-indigo-700 whitespace-nowrap">Split into:</span>
                              <div className="flex flex-wrap gap-2">
                                {transaction.splits.map((split, idx) => (
                                  <span key={idx} className="inline-flex items-center space-x-1 px-2 py-1 bg-white rounded-lg border border-indigo-200">
                                    <span>{split.category?.icon || '📌'}</span>
                                    <span className="font-medium text-gray-900">{split.category?.name || 'Uncategorized'}</span>
                                    <span className="text-gray-600">·</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(split.amount)}</span>
                                    {split.notes && (
                                      <>
                                        <span className="text-gray-600">·</span>
                                        <span className="text-gray-600 italic">{split.notes}</span>
                                      </>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-xl mb-2">📝 No transactions found</p>
              <p className="text-sm">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Click "Add Transaction" to get started'}
              </p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredTransactions.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        merchants={uniqueMerchants}
        transaction={editingTransaction}
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

