import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg';

    const variants = {
      default: 'bg-orange-500 text-white shadow-sm hover:bg-orange-600 active:scale-[0.98]',
      destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
      outline: 'border border-stone-300 bg-white hover:bg-stone-50 text-stone-900',
      secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
      ghost: 'hover:bg-stone-100 text-stone-700',
      link: 'text-orange-500 underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
