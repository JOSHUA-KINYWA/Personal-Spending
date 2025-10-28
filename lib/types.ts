// Database types
export interface Profile {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  is_default: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  merchant: string | null;
  payment_method: string | null;
  transaction_date: string;
  is_split: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  splits?: TransactionSplit[];
}

export interface TransactionSplit {
  id: string;
  transaction_id: string;
  category_id: string | null;
  amount: number;
  notes: string | null;
  created_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  merchant: string | null;
  payment_method: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  next_due_date: string;
  is_active: boolean;
  auto_mark_paid: boolean;
  reminder_days_before: number;
  last_generated_date: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null;
}

export interface CategorySpending {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyStats {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export interface Insight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  icon: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

