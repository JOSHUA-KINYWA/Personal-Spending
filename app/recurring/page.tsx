import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getRecurringTransactions, getUserCategories } from '@/lib/db-actions';
import DashboardLayout from '@/components/DashboardLayout';
import RecurringClient from '@/components/RecurringClient';

export default async function RecurringPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const recurringTransactions = await getRecurringTransactions();
  const categories = await getUserCategories();

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <DashboardLayout userData={userData}>
      <RecurringClient recurringTransactions={recurringTransactions} categories={categories} />
    </DashboardLayout>
  );
}

