'use server';

import { currentUser } from '@clerk/nextjs/server';
import { supabase } from './supabase';
import { DEFAULT_CATEGORIES } from './constants';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Profile, Category, Transaction, RecurringTransaction, TransactionSplit, SavingsGoal } from './types';

// Get or create user profile
export async function getOrCreateProfile(): Promise<Profile | null> {
  const user = await currentUser();
  if (!user) return null;

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', user.id)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      clerk_user_id: user.id,
      email: user.emailAddresses[0].emailAddress,
      full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
      currency: 'KES', // Default to KES
    })
    .select()
    .single();

  if (error) {
    // If profile already exists (race condition), fetch it
    if (error.code === '23505') {
      const { data: fetchedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();
      
      return fetchedProfile;
    }
    console.error('Error creating profile:', error);
    return null;
  }

  // Initialize default categories for new user
  if (newProfile) {
    await initializeDefaultCategories(newProfile.id);
  }

  return newProfile;
}

// Initialize default categories
async function initializeDefaultCategories(userId: string) {
  const categories = DEFAULT_CATEGORIES.map(cat => ({
    user_id: userId,
    ...cat,
    is_default: true,
  }));

  const { error } = await supabase
    .from('categories')
    .insert(categories);

  if (error) {
    console.error('Error creating default categories:', error);
  }
}

// Get user categories
export async function getUserCategories(): Promise<Category[]> {
  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', profile.id)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

// Add transaction
export async function addTransaction(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string;
  const categoryId = formData.get('category_id') as string;
  const description = formData.get('description') as string;
  const merchant = formData.get('merchant') as string;
  const paymentMethod = formData.get('payment_method') as string;
  const transactionDate = formData.get('transaction_date') as string;
  const isSplit = formData.get('is_split') === 'true';
  const splitsJson = formData.get('splits') as string;

  // Insert main transaction
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: profile.id,
      amount,
      type,
      category_id: isSplit ? null : (categoryId || null),
      description: description || null,
      merchant: merchant || null,
      payment_method: paymentMethod || null,
      transaction_date: transactionDate || new Date().toISOString().split('T')[0],
      is_split: isSplit,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction');
  }

  // If it's a split transaction, add the splits
  if (isSplit && splitsJson && transaction) {
    const splits = JSON.parse(splitsJson);
    const splitRecords = splits.map((split: any) => ({
      transaction_id: transaction.id,
      category_id: split.category_id || null,
      amount: parseFloat(split.amount),
      notes: split.notes || null,
    }));

    const { error: splitsError } = await supabase
      .from('transaction_splits')
      .insert(splitRecords);

    if (splitsError) {
      console.error('Error adding transaction splits:', splitsError);
      // Rollback the transaction
      await supabase.from('transactions').delete().eq('id', transaction.id);
      throw new Error('Failed to add transaction splits');
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/analytics');
}

// Update transaction
export async function updateTransaction(id: string, formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string;
  const categoryId = formData.get('category_id') as string;
  const description = formData.get('description') as string;
  const merchant = formData.get('merchant') as string;
  const paymentMethod = formData.get('payment_method') as string;
  const transactionDate = formData.get('transaction_date') as string;
  const isSplit = formData.get('is_split') === 'true';
  const splitsJson = formData.get('splits') as string;

  const { error } = await supabase
    .from('transactions')
    .update({
      amount,
      type,
      category_id: isSplit ? null : (categoryId || null),
      description: description || null,
      merchant: merchant || null,
      payment_method: paymentMethod || null,
      transaction_date: transactionDate,
      is_split: isSplit,
    })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }

  // Handle splits if it's a split transaction
  if (isSplit && splitsJson) {
    // Delete existing splits
    await supabase
      .from('transaction_splits')
      .delete()
      .eq('transaction_id', id);

    // Add new splits
    const splits = JSON.parse(splitsJson);
    const splitRecords = splits.map((split: any) => ({
      transaction_id: id,
      category_id: split.category_id || null,
      amount: parseFloat(split.amount),
      notes: split.notes || null,
    }));

    const { error: splitsError } = await supabase
      .from('transaction_splits')
      .insert(splitRecords);

    if (splitsError) {
      console.error('Error updating transaction splits:', splitsError);
      throw new Error('Failed to update transaction splits');
    }
  } else {
    // If it's no longer a split, delete any existing splits
    await supabase
      .from('transaction_splits')
      .delete()
      .eq('transaction_id', id);
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/analytics');
}

// Delete transaction
export async function deleteTransaction(id: string) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/analytics');
}

// Get transactions with filters
export async function getTransactions(filters?: {
  type?: string;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const profile = await getOrCreateProfile();
  if (!profile) return [];

  let query = supabase
    .from('transactions')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', profile.id);

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }

  query = query.order('transaction_date', { ascending: false });
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  let transactions = data || [];

  // Fetch splits for split transactions
  const transactionIds = transactions.filter(t => t.is_split).map(t => t.id);
  
  if (transactionIds.length > 0) {
    const { data: splitsData } = await supabase
      .from('transaction_splits')
      .select(`
        *,
        category:categories(*)
      `)
      .in('transaction_id', transactionIds);

    // Attach splits to their transactions
    transactions.forEach(transaction => {
      if (transaction.is_split) {
        transaction.splits = splitsData?.filter(s => s.transaction_id === transaction.id) || [];
      }
    });
  }

  // Client-side search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    transactions = transactions.filter(t =>
      t.description?.toLowerCase().includes(searchLower) ||
      t.category?.name.toLowerCase().includes(searchLower)
    );
  }

  return transactions;
}

// Set budget
export async function setBudget(categoryId: string, amount: number, month: string) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('budgets')
    .upsert({
      user_id: profile.id,
      category_id: categoryId,
      amount,
      month,
    }, {
      onConflict: 'user_id,category_id,month'
    });

  if (error) {
    console.error('Error setting budget:', error);
    throw new Error('Failed to set budget');
  }

  revalidatePath('/dashboard');
  revalidatePath('/budgets');
}

// Get budgets for current month
export async function getCurrentMonthBudgets() {
  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', profile.id)
    .eq('month', currentMonth);

  if (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }

  return data || [];
}

// ==================== RECURRING TRANSACTIONS ====================

// Helper function to calculate next due date based on frequency
function calculateNextDueDate(currentDate: string, frequency: string): string {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}

// Get all recurring transactions
export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('recurring_transactions')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', profile.id)
    .order('next_due_date', { ascending: true });

  if (error) {
    console.error('Error fetching recurring transactions:', error);
    return [];
  }

  return data || [];
}

// Create recurring transaction
export async function createRecurringTransaction(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string;
  const categoryId = formData.get('category_id') as string;
  const description = formData.get('description') as string;
  const merchant = formData.get('merchant') as string;
  const paymentMethod = formData.get('payment_method') as string;
  const frequency = formData.get('frequency') as string;
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  const autoMarkPaid = formData.get('auto_mark_paid') === 'true';
  const reminderDaysBefore = parseInt(formData.get('reminder_days_before') as string) || 3;

  const nextDueDate = calculateNextDueDate(startDate, frequency);

  const { error } = await supabase
    .from('recurring_transactions')
    .insert({
      user_id: profile.id,
      amount,
      type,
      category_id: categoryId || null,
      description,
      merchant: merchant || null,
      payment_method: paymentMethod || null,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      next_due_date: nextDueDate,
      is_active: true,
      auto_mark_paid: autoMarkPaid,
      reminder_days_before: reminderDaysBefore,
    });

  if (error) {
    console.error('Error creating recurring transaction:', error);
    throw new Error('Failed to create recurring transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/recurring');
}

// Update recurring transaction
export async function updateRecurringTransaction(id: string, formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const amount = parseFloat(formData.get('amount') as string);
  const type = formData.get('type') as string;
  const categoryId = formData.get('category_id') as string;
  const description = formData.get('description') as string;
  const merchant = formData.get('merchant') as string;
  const paymentMethod = formData.get('payment_method') as string;
  const frequency = formData.get('frequency') as string;
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  const autoMarkPaid = formData.get('auto_mark_paid') === 'true';
  const reminderDaysBefore = parseInt(formData.get('reminder_days_before') as string) || 3;

  const { error } = await supabase
    .from('recurring_transactions')
    .update({
      amount,
      type,
      category_id: categoryId || null,
      description,
      merchant: merchant || null,
      payment_method: paymentMethod || null,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      auto_mark_paid: autoMarkPaid,
      reminder_days_before: reminderDaysBefore,
    })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error updating recurring transaction:', error);
    throw new Error('Failed to update recurring transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/recurring');
}

// Delete recurring transaction
export async function deleteRecurringTransaction(id: string) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error deleting recurring transaction:', error);
    throw new Error('Failed to delete recurring transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/recurring');
}

// Toggle recurring transaction active status
export async function toggleRecurringTransaction(id: string, isActive: boolean) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('recurring_transactions')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error toggling recurring transaction:', error);
    throw new Error('Failed to toggle recurring transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/recurring');
}

// Generate transactions from due recurring transactions
export async function generateDueRecurringTransactions() {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const today = new Date().toISOString().split('T')[0];

  // Get all active recurring transactions that are due
  const { data: dueRecurring, error: fetchError } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .lte('next_due_date', today);

  if (fetchError) {
    console.error('Error fetching due recurring transactions:', fetchError);
    throw new Error('Failed to fetch due recurring transactions');
  }

  if (!dueRecurring || dueRecurring.length === 0) {
    return { generated: 0 };
  }

  let generatedCount = 0;

  // Generate transaction for each due recurring template
  for (const recurring of dueRecurring) {
    // Check if end_date is passed
    if (recurring.end_date && recurring.next_due_date > recurring.end_date) {
      // Deactivate if end date passed
      await supabase
        .from('recurring_transactions')
        .update({ is_active: false })
        .eq('id', recurring.id);
      continue;
    }

    // Create the transaction
    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: profile.id,
        amount: recurring.amount,
        type: recurring.type,
        category_id: recurring.category_id,
        description: `${recurring.description} (Auto-generated)`,
        merchant: recurring.merchant,
        payment_method: recurring.payment_method,
        transaction_date: recurring.next_due_date,
      });

    if (insertError) {
      console.error('Error creating transaction from recurring:', insertError);
      continue;
    }

    // Update recurring transaction with new next_due_date
    const newNextDueDate = calculateNextDueDate(recurring.next_due_date, recurring.frequency);
    
    await supabase
      .from('recurring_transactions')
      .update({
        next_due_date: newNextDueDate,
        last_generated_date: recurring.next_due_date,
      })
      .eq('id', recurring.id);

    generatedCount++;
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/recurring');

  return { generated: generatedCount };
}

// ==================== CATEGORY MANAGEMENT ====================

// Create custom category
export async function createCategory(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string;
  const color = formData.get('color') as string;
  const type = formData.get('type') as string;

  const { error } = await supabase
    .from('categories')
    .insert({
      user_id: profile.id,
      name,
      icon,
      color,
      type,
      is_default: false,
      is_archived: false,
    });

  if (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/categories');
  revalidatePath('/recurring');
}

// Update category
export async function updateCategory(id: string, formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string;
  const color = formData.get('color') as string;
  const type = formData.get('type') as string;

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      icon,
      color,
      type,
    })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/categories');
  revalidatePath('/recurring');
}

// Archive/Unarchive category
export async function toggleArchiveCategory(id: string, isArchived: boolean) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('categories')
    .update({ is_archived: isArchived })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error archiving category:', error);
    throw new Error('Failed to archive category');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/categories');
  revalidatePath('/recurring');
}

// Delete category (only if not used in transactions)
export async function deleteCategory(id: string) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  // Check if category is used in any transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id')
    .eq('category_id', id)
    .limit(1);

  if (transactions && transactions.length > 0) {
    throw new Error('Cannot delete category that is used in transactions. Archive it instead.');
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', profile.id)
    .eq('is_default', false); // Prevent deleting default categories

  if (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/categories');
  revalidatePath('/recurring');
}

// Update user currency preference
export async function updateCurrency(currency: string) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ currency })
    .eq('id', profile.id);

  if (error) {
    console.error('Error updating currency:', error);
    throw new Error('Failed to update currency');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/analytics');
  revalidatePath('/recurring');
}

// ==================== MERCHANT FUNCTIONS ====================

// Get unique merchants for autocomplete
export async function getUniqueMerchants(): Promise<string[]> {
  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('merchant')
    .eq('user_id', profile.id)
    .not('merchant', 'is', null)
    .order('merchant');

  if (error) {
    console.error('Error fetching merchants:', error);
    return [];
  }

  // Get unique merchants and filter out empty strings
  const uniqueMerchants = [...new Set(data.map(t => t.merchant).filter(Boolean))];
  return uniqueMerchants as string[];
}

// ==================== BILL REMINDERS ====================

// Get upcoming bill reminders (recurring transactions due soon)
export async function getUpcomingBillReminders(): Promise<RecurringTransaction[]> {
  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const today = new Date();
  
  // Get recurring transactions that are due within their reminder window
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('next_due_date', { ascending: true });

  if (error) {
    console.error('Error fetching bill reminders:', error);
    return [];
  }

  // Filter bills that are within their reminder window
  const upcomingBills = (data || []).filter(bill => {
    const dueDate = new Date(bill.next_due_date);
    const daysDifference = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDifference >= 0 && daysDifference <= bill.reminder_days_before;
  });

  return upcomingBills;
}

// ==================== SAVINGS GOALS ====================

// Get all savings goals
export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const profile = await getOrCreateProfile();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching savings goals:', error);
    return [];
  }

  return data || [];
}

// Create savings goal
export async function createSavingsGoal(formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const name = formData.get('name') as string;
  const targetAmount = parseFloat(formData.get('target_amount') as string);
  const currentAmount = parseFloat(formData.get('current_amount') as string) || 0;
  const deadline = formData.get('deadline') as string;
  const icon = formData.get('icon') as string || '🎯';
  const color = formData.get('color') as string || '#3B82F6';

  const { error } = await supabase
    .from('savings_goals')
    .insert({
      user_id: profile.id,
      name,
      target_amount: targetAmount,
      current_amount: currentAmount,
      deadline: deadline || null,
      icon,
      color,
      is_completed: false,
    });

  if (error) {
    console.error('Error creating savings goal:', error);
    throw new Error('Failed to create savings goal');
  }

  revalidatePath('/dashboard');
  revalidatePath('/goals');
}

// Update savings goal
export async function updateSavingsGoal(id: string, formData: FormData) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const name = formData.get('name') as string;
  const targetAmount = parseFloat(formData.get('target_amount') as string);
  const currentAmount = parseFloat(formData.get('current_amount') as string);
  const deadline = formData.get('deadline') as string;
  const icon = formData.get('icon') as string;
  const color = formData.get('color') as string;

  const { error } = await supabase
    .from('savings_goals')
    .update({
      name,
      target_amount: targetAmount,
      current_amount: currentAmount,
      deadline: deadline || null,
      icon,
      color,
      is_completed: currentAmount >= targetAmount,
    })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error updating savings goal:', error);
    throw new Error('Failed to update savings goal');
  }

  revalidatePath('/dashboard');
  revalidatePath('/goals');
}

// Contribute to savings goal
export async function contributeToGoal(id: string, amount: number) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  // Get current goal
  const { data: goal } = await supabase
    .from('savings_goals')
    .select('current_amount, target_amount')
    .eq('id', id)
    .eq('user_id', profile.id)
    .single();

  if (!goal) {
    throw new Error('Savings goal not found');
  }

  const newAmount = Number(goal.current_amount) + amount;
  const isCompleted = newAmount >= Number(goal.target_amount);

  const { error } = await supabase
    .from('savings_goals')
    .update({
      current_amount: newAmount,
      is_completed: isCompleted,
    })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error contributing to goal:', error);
    throw new Error('Failed to contribute to goal');
  }

  revalidatePath('/dashboard');
  revalidatePath('/goals');
}

// Delete savings goal
export async function deleteSavingsGoal(id: string) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error deleting savings goal:', error);
    throw new Error('Failed to delete savings goal');
  }

  revalidatePath('/dashboard');
  revalidatePath('/goals');
}

// Toggle goal completion status
export async function toggleGoalCompletion(id: string, isCompleted: boolean) {
  const profile = await getOrCreateProfile();
  if (!profile) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('savings_goals')
    .update({ is_completed: isCompleted })
    .eq('id', id)
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error toggling goal completion:', error);
    throw new Error('Failed to toggle goal completion');
  }

  revalidatePath('/dashboard');
  revalidatePath('/goals');
}

