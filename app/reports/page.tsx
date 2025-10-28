import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTransactions, getUserCategories, getOrCreateProfile } from '@/lib/db-actions';
import DashboardLayout from '@/components/DashboardLayout';
import ReportsClient from '@/components/ReportsClient';

export default async function ReportsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await getOrCreateProfile();
  const transactions = await getTransactions();
  const categories = await getUserCategories();

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <DashboardLayout userData={userData}>
      <ReportsClient 
        transactions={transactions} 
        categories={categories}
        currency={profile?.currency || 'KES'}
        userEmail={user.emailAddresses[0]?.emailAddress || ''}
      />
    </DashboardLayout>
  );
}

