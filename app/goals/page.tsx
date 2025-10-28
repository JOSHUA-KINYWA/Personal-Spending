import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getSavingsGoals, getOrCreateProfile } from '@/lib/db-actions';
import DashboardLayout from '@/components/DashboardLayout';
import SavingsGoalsClient from '@/components/SavingsGoalsClient';

export default async function GoalsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await getOrCreateProfile();
  const goals = await getSavingsGoals();

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <DashboardLayout userData={userData}>
      <SavingsGoalsClient goals={goals} currency={profile?.currency || 'KES'} />
    </DashboardLayout>
  );
}

