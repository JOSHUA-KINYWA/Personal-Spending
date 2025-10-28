import type { Transaction, Category } from './types';
import { formatCurrency, getCurrencySymbol } from './currencies';

export interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    icon: string;
    amount: number;
    percentage: number;
    count: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
  topExpenses: {
    date: string;
    description: string;
    category: string;
    amount: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    amount: number;
    percentage: number;
  }[];
  savingsRate: number;
  avgDailyExpense: number;
}

export function generateReportData(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
  period: 'monthly' | 'yearly',
  categories: Category[]
): ReportData {
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => 
    t.transaction_date >= startDate && t.transaction_date <= endDate
  );

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;
  const transactionCount = filteredTransactions.length;

  // Category breakdown
  const categoryMap = new Map<string, { amount: number; count: number; icon: string }>();
  
  filteredTransactions.forEach(t => {
    if (t.type === 'expense') {
      if (t.is_split && t.splits && t.splits.length > 0) {
        t.splits.forEach(split => {
          const catName = split.category?.name || 'Uncategorized';
          const catIcon = split.category?.icon || '📌';
          const current = categoryMap.get(catName) || { amount: 0, count: 0, icon: catIcon };
          categoryMap.set(catName, {
            amount: current.amount + Number(split.amount),
            count: current.count + 1,
            icon: catIcon
          });
        });
      } else {
        const catName = t.category?.name || 'Uncategorized';
        const catIcon = t.category?.icon || '📌';
        const current = categoryMap.get(catName) || { amount: 0, count: 0, icon: catIcon };
        categoryMap.set(catName, {
          amount: current.amount + Number(t.amount),
          count: current.count + 1,
          icon: catIcon
        });
      }
    }
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      icon: data.icon,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend (last 12 months or within period)
  const monthlyTrend = generateMonthlyTrend(filteredTransactions, startDate, endDate, period);

  // Top 5 expenses
  const topExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map(t => ({
      date: t.transaction_date,
      description: t.description || 'No description',
      category: t.is_split ? 'Split Transaction' : (t.category?.name || 'Uncategorized'),
      amount: Number(t.amount)
    }));

  // Payment method breakdown
  const paymentMap = new Map<string, number>();
  
  filteredTransactions.forEach(t => {
    const method = t.payment_method || 'Not specified';
    paymentMap.set(method, (paymentMap.get(method) || 0) + Number(t.amount));
  });

  const totalPayments = Array.from(paymentMap.values()).reduce((sum, amt) => sum + amt, 0);
  const paymentMethodBreakdown = Array.from(paymentMap.entries())
    .map(([method, amount]) => ({
      method,
      amount,
      percentage: totalPayments > 0 ? (amount / totalPayments) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate savings rate and average daily expense
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const daysDiff = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const avgDailyExpense = totalExpenses / daysDiff;

  return {
    period: period === 'monthly' ? 'Monthly Report' : 'Yearly Report',
    startDate,
    endDate,
    totalIncome,
    totalExpenses,
    netBalance,
    transactionCount,
    categoryBreakdown,
    monthlyTrend,
    topExpenses,
    paymentMethodBreakdown,
    savingsRate,
    avgDailyExpense
  };
}

function generateMonthlyTrend(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
  period: 'monthly' | 'yearly'
) {
  const trend: { month: string; income: number; expenses: number; balance: number }[] = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Generate monthly data points
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const monthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM
    
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
      month: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income,
      expenses,
      balance: income - expenses
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return trend;
}

export function getMonthDateRange(year: number, month: number): { startDate: string; endDate: string } {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

export function getYearDateRange(year: number): { startDate: string; endDate: string } {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`
  };
}

export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  return getMonthDateRange(now.getFullYear(), now.getMonth());
}

export function getCurrentYearRange(): { startDate: string; endDate: string } {
  const now = new Date();
  return getYearDateRange(now.getFullYear());
}

