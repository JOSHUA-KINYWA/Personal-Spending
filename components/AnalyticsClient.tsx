'use client';

import { formatCurrency, calculateSpendingTrend, calculateCategorySpending, calculatePercentageChange } from '@/lib/utils';
import type { Transaction, Category } from '@/lib/types';

interface AnalyticsClientProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function AnalyticsClient({ transactions, categories }: AnalyticsClientProps) {
  // Calculate 12-month trend
  const trend12Months = calculateSpendingTrend(transactions, 12);
  
  // Calculate current and previous month stats
  const currentMonthData = trend12Months[trend12Months.length - 1];
  const previousMonthData = trend12Months[trend12Months.length - 2];
  
  const incomeChange = calculatePercentageChange(
    currentMonthData?.income || 0,
    previousMonthData?.income || 0
  );
  
  const expenseChange = calculatePercentageChange(
    currentMonthData?.expenses || 0,
    previousMonthData?.expenses || 0
  );

  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Get category breakdown
  const categorySpending = calculateCategorySpending(transactions, categories);
  
  // Get top 5 categories
  const topCategories = categorySpending.slice(0, 5);

  // Calculate category trends (last 6 months)
  const categoryTrends = topCategories.map(cs => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      
      const monthTotal = transactions
        .filter(t => 
          t.type === 'expense' &&
          t.category_id === cs.category.id &&
          t.transaction_date.startsWith(monthStr)
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount: monthTotal,
      });
    }
    
    return {
      category: cs.category,
      trend: last6Months,
    };
  });

  // Calculate max value for scaling
  const maxMonthlyValue = Math.max(
    ...trend12Months.map(t => Math.max(t.income, t.expenses)),
    1
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Deep dive into your spending patterns and trends</p>
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Income</p>
            <p className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(totalIncome)}</p>
            {incomeChange !== 0 && (
              <p className={`text-sm ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}% from last month
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 mb-1">{formatCurrency(totalExpenses)}</p>
            {expenseChange !== 0 && (
              <p className={`text-sm ${expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange).toFixed(1)}% from last month
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Net Savings</p>
            <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Savings Rate</p>
            <p className="text-2xl font-bold text-indigo-600">
              {totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* 12-Month Trend */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">12-Month Income vs Expenses</h3>
          {trend12Months.some(t => t.income > 0 || t.expenses > 0) ? (
            <div className="space-y-4">
              {trend12Months.map((data, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700 w-24">{data.month}</span>
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex-1 flex h-10 bg-gray-100 rounded-lg overflow-hidden">
                        {data.income > 0 && (
                          <div
                            className="bg-green-500 flex items-center justify-end pr-2"
                            style={{ width: `${(data.income / maxMonthlyValue) * 100}%` }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {formatCurrency(data.income)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex h-10 bg-gray-100 rounded-lg overflow-hidden">
                        {data.expenses > 0 && (
                          <div
                            className="bg-red-500 flex items-center justify-start pl-2"
                            style={{ width: `${(data.expenses / maxMonthlyValue) * 100}%` }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {formatCurrency(data.expenses)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center space-x-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Expenses</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">📊 No data available</p>
              <p className="text-sm">Add transactions to see trends</p>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top 5 Spending Categories</h3>
            {topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map((cs, idx) => (
                  <div key={cs.category.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{cs.category.icon}</span>
                        <span className="font-semibold text-gray-900">{cs.category.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(cs.total)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${cs.percentage}%`,
                            backgroundColor: cs.category.color,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 min-w-[60px] text-right">
                        {cs.percentage.toFixed(1)}% ({cs.count} txns)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">📊 No spending data</p>
                <p className="text-sm">Add expenses to see category breakdown</p>
              </div>
            )}
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Comparison</h3>
            {trend12Months.slice(-6).some(t => t.income > 0 || t.expenses > 0) ? (
              <div className="space-y-4">
                {trend12Months.slice(-6).map((data, idx) => {
                  const balance = data.income - data.expenses;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{data.month}</span>
                        <span className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                        </span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{
                            width: `${Math.abs(balance) / Math.max(...trend12Months.map(t => Math.abs(t.income - t.expenses)), 1) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">📈 No comparison data</p>
                <p className="text-sm">Need more transaction history</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Spending Trends */}
        {categoryTrends.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Category Spending Trends (6 Months)</h3>
            <div className="space-y-6">
              {categoryTrends.map(ct => {
                const maxAmount = Math.max(...ct.trend.map(t => t.amount), 1);
                return (
                  <div key={ct.category.id}>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl">{ct.category.icon}</span>
                      <span className="font-semibold text-gray-900">{ct.category.name}</span>
                    </div>
                    <div className="flex items-end space-x-2 h-32">
                      {ct.trend.map((t, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                            <div
                              className="w-full rounded-t-lg transition-all hover:opacity-80"
                              style={{
                                height: `${(t.amount / maxAmount) * 100}%`,
                                backgroundColor: ct.category.color,
                                minHeight: t.amount > 0 ? '4px' : '0',
                              }}
                              title={formatCurrency(t.amount)}
                            />
                          </div>
                          <span className="text-xs text-gray-600 mt-2">{t.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}

