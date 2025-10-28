import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrCreateProfile, getTransactions, getUserCategories, getCurrentMonthBudgets, getUpcomingBillReminders } from '@/lib/db-actions';
import { calculateMonthlyStats, calculateCategorySpending, calculateSpendingTrend, generateInsights } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardContent from '@/components/DashboardContent';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get user profile and data
  const profile = await getOrCreateProfile();
  const transactions = await getTransactions();
  const categories = await getUserCategories();
  const budgets = await getCurrentMonthBudgets();
  const upcomingBills = await getUpcomingBillReminders();

  // Calculate statistics
  const stats = calculateMonthlyStats(transactions);
  const categorySpending = calculateCategorySpending(transactions, categories);
  const spendingTrend = calculateSpendingTrend(transactions, 6);
  const insights = generateInsights(transactions, categorySpending, budgets);

  // Get recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Convert user to plain object for client component
  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <DashboardLayout userData={userData}>
      <DashboardContent
        currency={profile?.currency || 'KES'}
        stats={stats}
        categorySpending={categorySpending}
        spendingTrend={spendingTrend}
        insights={insights}
        recentTransactions={recentTransactions}
        categories={categories}
        upcomingBills={upcomingBills}
      />
    </DashboardLayout>
  );
}

