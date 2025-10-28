import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserCategories } from '@/lib/db-actions';
import DashboardLayout from '@/components/DashboardLayout';
import CategoriesClient from '@/components/CategoriesClient';

export default async function CategoriesPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const categories = await getUserCategories();
  
  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress || '',
  };

  return (
    <DashboardLayout userData={userData}>
      <CategoriesClient categories={categories} />
    </DashboardLayout>
  );
}

