export default function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin`}></div>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-semibold">Loading...</p>
      </div>
    </div>
  );
}

