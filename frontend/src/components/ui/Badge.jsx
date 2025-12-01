import React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-orange-500 text-white',
    secondary: 'bg-stone-100 text-stone-700',
    success: 'bg-green-100 text-green-700',
    destructive: 'bg-red-100 text-red-700',
    outline: 'border border-stone-300 text-stone-700',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
