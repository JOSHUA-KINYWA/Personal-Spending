import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm',
              card: 'shadow-xl',
            }
          }}
        />
      </div>
    </div>
  );
}

