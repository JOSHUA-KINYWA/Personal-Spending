'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { BUDGET_TEMPLATES, calculateBudgetFromTemplate, type BudgetTemplate } from '@/lib/budget-templates';
import { formatCurrency } from '@/lib/utils';
import { setBudget } from '@/lib/db-actions';
import type { Category } from '@/lib/types';

interface BudgetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currency: string;
}

export default function BudgetTemplateModal({ isOpen, onClose, categories, currency }: BudgetTemplateModalProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplate | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: BudgetTemplate) => {
    setSelectedTemplate(template);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedTemplate(null);
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate || !monthlyIncome) return;

    setIsApplying(true);
    try {
      const income = parseFloat(monthlyIncome);
      const budgetItems = calculateBudgetFromTemplate(selectedTemplate, income);

      // Get current month
      const currentDate = new Date();
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

      // Apply budgets by matching template categories to user categories
      const promises = budgetItems.map(async (item) => {
        // Find matching category or create a suggestion
        const matchingCategory = categories.find(cat => 
          cat.name.toLowerCase().includes(item.category.name.toLowerCase()) ||
          item.category.name.toLowerCase().includes(cat.name.toLowerCase())
        );

        if (matchingCategory) {
          await setBudget(matchingCategory.id, item.amount, month);
        }
      });

      await Promise.all(promises);

      toast.success(`Budget template "${selectedTemplate.name}" applied successfully!`);
      onClose();
      setStep(1);
      setSelectedTemplate(null);
      setMonthlyIncome('');
    } catch (error) {
      console.error('Error applying budget template:', error);
      toast.error('Failed to apply budget template. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const calculatedBudgets = selectedTemplate && monthlyIncome 
    ? calculateBudgetFromTemplate(selectedTemplate, parseFloat(monthlyIncome) || 0)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {step === 1 ? '📋 Budget Templates' : '💰 Set Your Income'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {step === 1 
                  ? 'Choose a pre-made template to quickly set up your budget'
                  : 'Enter your monthly income to calculate budget amounts'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Popular Templates */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">⭐ Popular Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUDGET_TEMPLATES.filter(t => t.popular).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{template.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                            {template.categories.length} categories →
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Templates */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">📚 More Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUDGET_TEMPLATES.filter(t => !t.popular).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{template.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                            {template.categories.length} categories →
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Income Input & Preview */}
          {step === 2 && selectedTemplate && (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to templates</span>
              </button>

              {/* Selected Template Info */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
                  </div>
                </div>
              </div>

              {/* Income Input */}
              <div>
                <label htmlFor="income" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Enter Your Monthly Income
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-lg">
                    {currency}
                  </span>
                  <input
                    type="number"
                    id="income"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Budget Breakdown Preview */}
              {monthlyIncome && parseFloat(monthlyIncome) > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    📊 Your Budget Breakdown
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {calculatedBudgets.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.category.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.category.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{item.category.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.amount, currency)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 p-4 bg-indigo-100 dark:bg-indigo-950/30 rounded-lg border-2 border-indigo-300 dark:border-indigo-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">Total Monthly Budget:</span>
                      <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(parseFloat(monthlyIncome), currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>💡 Note:</strong> The template will create budgets for your existing categories that match the template categories. You can adjust individual budgets later.
                </p>
              </div>

              {/* Apply Button */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!monthlyIncome || parseFloat(monthlyIncome) <= 0 || isApplying}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplying ? 'Applying...' : '✨ Apply Template'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

