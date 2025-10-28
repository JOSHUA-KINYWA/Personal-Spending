'use client';

import { useState, useEffect } from 'react';
import { createCategory, updateCategory } from '@/lib/db-actions';
import { CATEGORY_ICONS, CATEGORY_COLORS, getColorClasses } from '@/lib/category-options';
import type { Category } from '@/lib/types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

export default function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState('#6366F1');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
      setType(category.type);
    } else {
      setName('');
      setIcon('💰');
      setColor('#6366F1');
      setType('expense');
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('icon', icon);
    formData.append('color', color);
    formData.append('type', type);

    try {
      if (category) {
        await updateCategory(category.id, formData);
      } else {
        await createCategory(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedColorClasses = getColorClasses(color);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {category ? '✏️ Edit Category' : '➕ Create Category'}
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
            {/* Preview */}
            <div className="flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl">
              <div className={`w-24 h-24 ${selectedColorClasses.light} dark:bg-gray-600 rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-5xl">{icon}</span>
              </div>
              <div className="ml-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preview</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{name || 'Category Name'}</p>
                <p className={`text-sm font-semibold ${selectedColorClasses.text}`}>
                  {type === 'income' ? 'Income' : type === 'expense' ? 'Expense' : 'Both'}
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={30}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Groceries, Salary, etc."
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Icon
              </label>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">Select Icon</span>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showIconPicker && (
                <div className="mt-2 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 max-h-64 overflow-y-auto grid grid-cols-8 gap-2">
                  {CATEGORY_ICONS.map((ic, index) => (
                    <button
                      key={`icon-${index}`}
                      type="button"
                      onClick={() => {
                        setIcon(ic);
                        setShowIconPicker(false);
                      }}
                      className={`p-2 text-2xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                        icon === ic ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-600' : ''
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg ${selectedColorClasses.bg}`}></div>
                  <span className="text-gray-700 dark:text-gray-300">{selectedColorClasses.name}</span>
                </div>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showColorPicker && (
                <div className="mt-2 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 grid grid-cols-6 gap-3">
                  {CATEGORY_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => {
                        setColor(col.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-12 h-12 rounded-lg ${col.bg} hover:scale-110 transition-transform ${
                        color === col.value ? 'ring-4 ring-gray-900 dark:ring-white scale-110' : ''
                      }`}
                      title={col.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Category Type
              </label>
              <div className="grid grid-cols-3 gap-3">
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
                <button
                  type="button"
                  onClick={() => setType('both')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    type === 'both'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  💵 Both
                </button>
              </div>
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
                disabled={isSubmitting || !name}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

