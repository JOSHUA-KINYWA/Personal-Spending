-- Personal Spending Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transaction_splits CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Clerk user data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  currency TEXT DEFAULT 'KES',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
  is_default BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  merchant TEXT,
  payment_method TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_split BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Splits table (for splitting one transaction across multiple categories)
CREATE TABLE transaction_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category_id, month)
);

-- Recurring Transactions table
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  merchant TEXT,
  payment_method TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  auto_mark_paid BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 3,
  last_generated_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Savings Goals table
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  deadline DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#3B82F6',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_is_split ON transactions(is_split);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction_id ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_splits_category_id ON transaction_splits(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_due ON recurring_transactions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active ON recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_deadline ON savings_goals(deadline);
CREATE INDEX IF NOT EXISTS idx_savings_goals_completed ON savings_goals(is_completed);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true);

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (true);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (true);

-- Transaction Splits policies
CREATE POLICY "Users can view transaction splits" ON transaction_splits
  FOR SELECT USING (true);

CREATE POLICY "Users can insert transaction splits" ON transaction_splits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update transaction splits" ON transaction_splits
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete transaction splits" ON transaction_splits
  FOR DELETE USING (true);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (true);

-- Recurring Transactions policies
CREATE POLICY "Users can view own recurring transactions" ON recurring_transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own recurring transactions" ON recurring_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own recurring transactions" ON recurring_transactions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own recurring transactions" ON recurring_transactions
  FOR DELETE USING (true);

-- Savings Goals policies
CREATE POLICY "Users can view own savings goals" ON savings_goals
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own savings goals" ON savings_goals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own savings goals" ON savings_goals
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own savings goals" ON savings_goals
  FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

