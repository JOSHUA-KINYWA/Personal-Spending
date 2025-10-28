import type { Transaction, CategorySpending, MonthlyStats, Insight, Category } from './types';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol as getCurrencySymbolUtil } from './currencies';

// Export from currencies.ts for consistency
export { formatCurrency, getCurrencySymbol } from './currencies';

// Use internal references
const formatCurrency = formatCurrencyUtil;
const getCurrencySymbol = getCurrencySymbolUtil;

// Format date
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Calculate monthly stats
export function calculateMonthlyStats(transactions: Transaction[]): MonthlyStats {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthTransactions = transactions.filter(t => 
    t.transaction_date.startsWith(currentMonth)
  );

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    income,
    expenses,
    balance: income - expenses,
    transactionCount: monthTransactions.length,
  };
}

// Calculate category spending
export function calculateCategorySpending(
  transactions: Transaction[],
  categories: Category[]
): CategorySpending[] {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthExpenses = transactions.filter(t => 
    t.type === 'expense' && t.transaction_date.startsWith(currentMonth)
  );

  const totalExpenses = monthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryMap = new Map<string, { total: number; count: number }>();

  monthExpenses.forEach(t => {
    // Handle split transactions
    if (t.is_split && t.splits && t.splits.length > 0) {
      t.splits.forEach(split => {
        if (split.category_id) {
          const current = categoryMap.get(split.category_id) || { total: 0, count: 0 };
          categoryMap.set(split.category_id, {
            total: current.total + Number(split.amount),
            count: current.count + 1,
          });
        }
      });
    } else if (t.category_id) {
      // Handle regular transactions
      const current = categoryMap.get(t.category_id) || { total: 0, count: 0 };
      categoryMap.set(t.category_id, {
        total: current.total + Number(t.amount),
        count: current.count + 1,
      });
    }
  });

  const categorySpending: CategorySpending[] = [];

  categories.forEach(category => {
    const data = categoryMap.get(category.id);
    if (data) {
      categorySpending.push({
        category,
        total: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
        count: data.count,
      });
    }
  });

  return categorySpending.sort((a, b) => b.total - a.total);
}

// Calculate spending trend (last N months)
export function calculateSpendingTrend(transactions: Transaction[], months: number = 6) {
  const trend: { month: string; income: number; expenses: number }[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    
    const monthTransactions = transactions.filter(t => 
      t.transaction_date.startsWith(monthStr)
    );

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    trend.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income,
      expenses,
    });
  }

  return trend;
}

// Generate smart insights
export function generateInsights(
  transactions: Transaction[],
  categorySpending: CategorySpending[],
  budgets: any[]
): Insight[] {
  const insights: Insight[] = [];
  const stats = calculateMonthlyStats(transactions);

  // Budget alerts
  budgets.forEach(budget => {
    const spending = categorySpending.find(cs => cs.category.id === budget.category_id);
    if (spending) {
      const percentage = (spending.total / budget.amount) * 100;
      
      if (percentage > 100) {
        insights.push({
          type: 'warning',
          title: `${budget.category.name} Budget Exceeded`,
          description: `You've spent ${formatCurrency(spending.total)} (${percentage.toFixed(0)}% of your ${formatCurrency(budget.amount)} budget)`,
          icon: '⚠️',
        });
      } else if (percentage > 80) {
        insights.push({
          type: 'warning',
          title: `${budget.category.name} Budget Alert`,
          description: `You're at ${percentage.toFixed(0)}% of your budget. ${formatCurrency(budget.amount - spending.total)} remaining.`,
          icon: '🔔',
        });
      }
    }
  });

  // Top spending category
  if (categorySpending.length > 0) {
    const top = categorySpending[0];
    insights.push({
      type: 'info',
      title: 'Top Spending Category',
      description: `${top.category.name} accounts for ${top.percentage.toFixed(1)}% of your expenses (${formatCurrency(top.total)})`,
      icon: top.category.icon,
    });
  }

  // Savings rate
  if (stats.income > 0) {
    const savingsRate = ((stats.income - stats.expenses) / stats.income) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Great Savings Rate!',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income this month. Keep it up!`,
        icon: '🎉',
      });
    } else if (savingsRate < 0) {
      insights.push({
        type: 'warning',
        title: 'Spending More Than Earning',
        description: `Your expenses exceed your income by ${formatCurrency(Math.abs(stats.balance))}. Consider reviewing your spending.`,
        icon: '💸',
      });
    }
  }

  // Unusual spending detection
  const avgDailyExpense = stats.expenses / new Date().getDate();
  const recentExpenses = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
    .slice(0, 5);

  const highExpenses = recentExpenses.filter(t => Number(t.amount) > avgDailyExpense * 3);
  if (highExpenses.length > 0) {
    insights.push({
      type: 'info',
      title: 'Unusual High Expense Detected',
      description: `Recent transaction of ${formatCurrency(highExpenses[0].amount)} is higher than usual.`,
      icon: '📊',
    });
  }

  return insights;
}

// Get month name
export function getMonthName(monthIndex: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex] || '';
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

