'use client';

import { useState, useEffect } from 'react';
import { createSavingsGoal, updateSavingsGoal } from '@/lib/db-actions';
import type { SavingsGoal } from '@/lib/types';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: SavingsGoal;
  currency?: string;
}

const GOAL_ICONS = ['🎯', '💰', '🏠', '🚗', '✈️', '🎓', '💍', '🏖️', '📱', '🎮'];
const GOAL_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export default function SavingsGoalModal({
  isOpen,
  onClose,
  goal,
  currency = 'KES',
}: SavingsGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      setSelectedIcon(goal.icon);
      setSelectedColor(goal.color);
    } else {
      setSelectedIcon('🎯');
      setSelectedColor('#3B82F6');
    }
    setError('');
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('icon', selectedIcon);
      formData.set('color', selectedColor);
      
      if (isEditing && goal) {
        await updateSavingsGoal(goal.id, formData);
      } else {
        await createSavingsGoal(formData);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save savings goal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Goal Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {GOAL_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                      selectedIcon === icon
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-110'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Goal Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {GOAL_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Goal Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Goal Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={goal?.name || ''}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
              />
            </div>

            {/* Target Amount */}
            <div>
              <label htmlFor="target_amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Amount ({currency})
              </label>
              <input
                type="number"
                id="target_amount"
                name="target_amount"
                step="0.01"
                min="0"
                required
                defaultValue={goal?.target_amount || ''}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>

            {/* Current Amount */}
            <div>
              <label htmlFor="current_amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Current Amount ({currency})
              </label>
              <input
                type="number"
                id="current_amount"
                name="current_amount"
                step="0.01"
                min="0"
                defaultValue={goal?.current_amount || '0'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Date (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                defaultValue={goal?.deadline || ''}
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
                disabled={loading}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

