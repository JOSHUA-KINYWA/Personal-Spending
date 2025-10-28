'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import SavingsGoalModal from './SavingsGoalModal';
import ConfirmDialog from './ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { deleteSavingsGoal, contributeToGoal, toggleGoalCompletion } from '@/lib/db-actions';
import type { SavingsGoal } from '@/lib/types';

interface SavingsGoalsClientProps {
  goals: SavingsGoal[];
  currency?: string;
}

export default function SavingsGoalsClient({
  goals,
  currency = 'KES',
}: SavingsGoalsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>();
  const [contributingTo, setContributingTo] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
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

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Savings Goal',
      message: 'Are you sure you want to delete this savings goal? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteSavingsGoal(id);
          toast.success('Savings goal deleted successfully!');
        } catch (error) {
          toast.error('Failed to delete savings goal');
        }
      },
    });
  };

  const handleContribute = async (goalId: string) => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await contributeToGoal(goalId, amount);
      setContributingTo(null);
      setContributionAmount('');
      toast.success(`Successfully added ${formatCurrency(amount, currency)} to your goal!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to contribute to goal');
    }
  };

  const handleToggleCompletion = async (goalId: string, isCompleted: boolean) => {
    try {
      await toggleGoalCompletion(goalId, !isCompleted);
      toast.success(isCompleted ? 'Goal marked as incomplete' : 'Goal marked as complete! 🎉');
    } catch (error) {
      toast.error('Failed to toggle goal completion');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(undefined);
  };

  const getProgressPercentage = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const target = new Date(deadline);
    const daysDifference = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference;
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);

  return (
    <div className="p-6">
      {/* Header with actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Savings Goals 🎯</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your progress towards financial goals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>New Goal</span>
        </button>
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalSaved, currency)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Target Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalTarget, currency)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{activeGoals.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Goals</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGoals.map((goal) => {
                const progress = getProgressPercentage(Number(goal.current_amount), Number(goal.target_amount));
                const daysUntil = getDaysUntilDeadline(goal.deadline);
                const remaining = Number(goal.target_amount) - Number(goal.current_amount);

                return (
                  <div
                    key={goal.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    style={{ borderLeft: `4px solid ${goal.color}` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{goal.icon}</span>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">{goal.name}</h4>
                          {goal.deadline && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {daysUntil !== null && daysUntil > 0 && `${daysUntil} days remaining`}
                              {daysUntil !== null && daysUntil === 0 && 'Due today!'}
                              {daysUntil !== null && daysUntil < 0 && `${Math.abs(daysUntil)} days overdue`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit goal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete goal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: goal.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(Number(goal.current_amount), currency)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                          <p className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(remaining, currency)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Target</p>
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(Number(goal.target_amount), currency)}</p>
                        </div>
                      </div>

                      {/* Contribute Button */}
                      {contributingTo === goal.id ? (
                        <div className="flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <input
                            type="number"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            placeholder="Amount"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleContribute(goal.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setContributingTo(null);
                              setContributionAmount('');
                            }}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setContributingTo(goal.id)}
                          className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Contribute</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Completed Goals 🎉</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-green-50 dark:bg-green-900/10 rounded-xl shadow-md p-6 border-2 border-green-300 dark:border-green-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{goal.name}</h4>
                        <p className="text-sm text-green-600 dark:text-green-400 font-semibold">✓ Completed</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCompletion(goal.id, goal.is_completed)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Mark as incomplete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(Number(goal.current_amount), currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎯</span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Savings Goals Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your financial goals and watch your savings grow!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Your First Goal</span>
            </button>
          </div>
        )}
      
      {/* Goal Modal */}
      <SavingsGoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        goal={editingGoal}
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

