'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import CategoryModal from './CategoryModal';
import ConfirmDialog from './ConfirmDialog';
import { deleteCategory, toggleArchiveCategory } from '@/lib/db-actions';
import { getColorClasses } from '@/lib/category-options';
import type { Category } from '@/lib/types';

interface CategoriesClientProps {
  categories: Category[];
}

export default function CategoriesClient({ categories: initialCategories }: CategoriesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
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

  function handleAdd() {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  }

  function handleEdit(category: Category) {
    setSelectedCategory(category);
    setIsModalOpen(true);
  }

  async function handleArchive(id: string, currentStatus: boolean) {
    try {
      await toggleArchiveCategory(id, !currentStatus);
      toast.success(`Category ${currentStatus ? 'unarchived' : 'archived'} successfully!`);
    } catch (error) {
      console.error('Failed to archive category:', error);
      toast.error('Failed to archive category');
    }
  }

  async function handleDelete(id: string, name: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone and will affect all associated transactions.`,
      onConfirm: async () => {
        try {
          await deleteCategory(id);
          toast.success('Category deleted successfully!');
        } catch (error) {
          console.error('Failed to delete category:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to delete category');
        }
      },
    });
  }

  const activeCategories = initialCategories.filter(c => !c.is_archived);
  const archivedCategories = initialCategories.filter(c => c.is_archived);
  const customCategories = activeCategories.filter(c => !c.is_default);
  const defaultCategories = activeCategories.filter(c => c.is_default);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎨 Manage Categories</h2>
        <p className="text-gray-600 dark:text-gray-400">Customize your spending categories with icons and colors</p>
      </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="mb-8 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Custom Category</span>
        </button>

        {/* Custom Categories */}
        {customCategories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">✨ Custom Categories ({customCategories.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customCategories.map((category) => {
                const colorClasses = getColorClasses(category.color);
                return (
                  <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${colorClasses.light} dark:bg-gray-600 rounded-lg flex items-center justify-center`}>
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{category.name}</h4>
                          <span className={`text-xs font-semibold ${colorClasses.text}`}>
                            {category.type === 'income' ? '💰 Income' : category.type === 'expense' ? '💸 Expense' : '💵 Both'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(category.id, category.is_archived)}
                        className="flex-1 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-semibold rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-sm"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Default Categories */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📦 Default Categories ({defaultCategories.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultCategories.map((category) => {
              const colorClasses = getColorClasses(category.color);
              return (
                <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 opacity-75">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${colorClasses.light} dark:bg-gray-600 rounded-lg flex items-center justify-center`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{category.name}</h4>
                      <span className={`text-xs font-semibold ${colorClasses.text}`}>
                        {category.type === 'income' ? '💰 Income' : category.type === 'expense' ? '💸 Expense' : '💵 Both'}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Default • Cannot be edited</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Archived Categories */}
        {archivedCategories.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📁 Archived Categories ({archivedCategories.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedCategories.map((category) => {
                const colorClasses = getColorClasses(category.color);
                return (
                  <div key={category.id} className="bg-gray-100 dark:bg-gray-800/50 rounded-xl shadow p-5 opacity-60 hover:opacity-100 transition-opacity border border-gray-300 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${colorClasses.light} dark:bg-gray-600 rounded-lg flex items-center justify-center`}>
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{category.name}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Archived</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleArchive(category.id, category.is_archived)}
                      className="w-full px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                    >
                      Unarchive
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State for Custom Categories */}
        {customCategories.length === 0 && archivedCategories.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Custom Categories Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your own categories with custom icons and colors
            </p>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Create Your First Category
            </button>
          </div>
        )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
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

