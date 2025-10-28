import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTransactions, getUserCategories, getOrCreateProfile } from '@/lib/db-actions';
import DashboardLayout from '@/components/DashboardLayout';
import TransactionsClient from '@/components/TransactionsClient';

export default async function TransactionsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await getOrCreateProfile();
  const transactions = await getTransactions();
  const categories = await getUserCategories();

  // Convert user to plain object for client component
  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <DashboardLayout userData={userData}>
      <TransactionsClient transactions={transactions} categories={categories} currency={profile?.currency || 'KES'} />
    </DashboardLayout>
  );
}

