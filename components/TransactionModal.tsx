'use client';

import { useState, useEffect } from 'react';
import { addTransaction, updateTransaction } from '@/lib/db-actions';
import { PAYMENT_METHODS } from '@/lib/constants';
import type { Transaction, Category } from '@/lib/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  merchants?: string[];
  transaction?: Transaction;
}

interface Split {
  category_id: string;
  amount: string;
  notes: string;
}

export default function TransactionModal({
  isOpen,
  onClose,
  categories,
  merchants = [],
  transaction,
}: TransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [showMerchantSuggestions, setShowMerchantSuggestions] = useState(false);
  const [splits, setSplits] = useState<Split[]>([
    { category_id: '', amount: '', notes: '' },
    { category_id: '', amount: '', notes: '' },
  ]);

  const isEditing = !!transaction;

  useEffect(() => {
    if (transaction) {
      setTotalAmount(transaction.amount.toString());
      setMerchant(transaction.merchant || '');
      setIsSplit(transaction.is_split || false);
      if (transaction.is_split && transaction.splits) {
        setSplits(transaction.splits.map(s => ({
          category_id: s.category_id || '',
          amount: s.amount.toString(),
          notes: s.notes || '',
        })));
      }
    } else {
      setTotalAmount('');
      setMerchant('');
      setIsSplit(false);
      setSplits([
        { category_id: '', amount: '', notes: '' },
        { category_id: '', amount: '', notes: '' },
      ]);
    }
  }, [transaction, isOpen]);

  const addSplit = () => {
    setSplits([...splits, { category_id: '', amount: '', notes: '' }]);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 2) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const updateSplit = (index: number, field: keyof Split, value: string) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const getSplitTotal = () => {
    return splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('is_split', isSplit.toString());
      
      // Validate split transaction
      if (isSplit) {
        const total = parseFloat(totalAmount);
        const splitTotal = getSplitTotal();
        
        if (Math.abs(total - splitTotal) > 0.01) {
          setError(`Split amounts (${splitTotal.toFixed(2)}) must equal total amount (${total.toFixed(2)})`);
          setLoading(false);
          return;
        }

        // Validate that all splits have categories and amounts
        const invalidSplits = splits.filter(s => !s.category_id || !s.amount || parseFloat(s.amount) <= 0);
        if (invalidSplits.length > 0) {
          setError('All splits must have a category and valid amount');
          setLoading(false);
          return;
        }

        formData.set('splits', JSON.stringify(splits));
      }
      
      if (isEditing && transaction) {
        await updateTransaction(transaction.id, formData);
      } else {
        await addTransaction(formData);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const splitTotal = getSplitTotal();
  const totalAmountNum = parseFloat(totalAmount) || 0;
  const isValid = !isSplit || Math.abs(totalAmountNum - splitTotal) < 0.01;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    name="type"
                    value="expense"
                    defaultChecked={!isEditing || transaction?.type === 'expense'}
                    className="peer sr-only"
                    required
                  />
                  <div className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-all peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 hover:border-gray-300 dark:hover:border-gray-500">
                    <span className="text-lg">💸</span>
                    <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">Expense</span>
                  </div>
                </label>
                <label className="relative">
                  <input
                    type="radio"
                    name="type"
                    value="income"
                    defaultChecked={transaction?.type === 'income'}
                    className="peer sr-only"
                    required
                  />
                  <div className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer transition-all peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 hover:border-gray-300 dark:hover:border-gray-500">
                    <span className="text-lg">💰</span>
                    <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">Income</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Split Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✂️</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Split Transaction</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Divide across multiple categories</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSplit(!isSplit)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSplit ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSplit ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Total Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              {isSplit && (
                <div className={`mt-2 text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Split total: ${splitTotal.toFixed(2)} {isValid ? '✓' : `(needs $${Math.abs(totalAmountNum - splitTotal).toFixed(2)} ${totalAmountNum > splitTotal ? 'more' : 'less'})`}
                </div>
              )}
            </div>

            {/* Splits Section */}
            {isSplit ? (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Split Into</h3>
                  <button
                    type="button"
                    onClick={addSplit}
                    className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    + Add Split
                  </button>
                </div>

                {splits.map((split, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="flex-1 space-y-2">
                        <select
                          value={split.category_id}
                          onChange={(e) => updateSplit(index, 'category_id', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                        
                        <div className="flex items-center space-x-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">
                              $
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={split.amount}
                              onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                              className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <input
                            type="text"
                            value={split.notes}
                            onChange={(e) => updateSplit(index, 'notes', e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Notes (optional)"
                          />
                        </div>
                      </div>
                      
                      {splits.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeSplit(index)}
                          className="mt-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Regular Category (non-split) */
              <div>
                <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  defaultValue={transaction?.category_id || ''}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={transaction?.description || ''}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional notes about this transaction"
              />
            </div>

            {/* Merchant with Autocomplete */}
            <div className="relative">
              <label htmlFor="merchant" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Merchant
              </label>
              <input
                type="text"
                id="merchant"
                name="merchant"
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value);
                  setShowMerchantSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowMerchantSuggestions(merchant.length > 0)}
                onBlur={() => setTimeout(() => setShowMerchantSuggestions(false), 200)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Walmart, Amazon, etc."
              />
              {showMerchantSuggestions && merchant && merchants.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {merchants
                    .filter(m => m.toLowerCase().includes(merchant.toLowerCase()))
                    .slice(0, 5)
                    .map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMerchant(m);
                          setShowMerchantSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                      >
                        {m}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                id="payment_method"
                name="payment_method"
                defaultValue={transaction?.payment_method || ''}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select payment method</option>
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="transaction_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                id="transaction_date"
                name="transaction_date"
                defaultValue={transaction?.transaction_date || new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (isSplit && !isValid)}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditing ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
