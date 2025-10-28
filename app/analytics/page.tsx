import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTransactions, getUserCategories } from '@/lib/db-actions';
import DashboardLayout from '@/components/DashboardLayout';
import AnalyticsClient from '@/components/AnalyticsClient';

export default async function AnalyticsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const transactions = await getTransactions();
  const categories = await getUserCategories();

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <DashboardLayout userData={userData}>
      <AnalyticsClient transactions={transactions} categories={categories} />
    </DashboardLayout>
  );
}

