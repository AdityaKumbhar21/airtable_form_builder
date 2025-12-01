import React from 'react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-2 cursor-pointer transition-all duration-200 accent-orange-500',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
