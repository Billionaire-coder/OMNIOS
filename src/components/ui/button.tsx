import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

        const variants = {
            primary: "bg-[#00ffd5] text-black hover:bg-[#00ffd5]/90 shadow-sm",
            secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            destructive: "bg-red-500 text-white hover:bg-red-600",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-white border-white/20",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-9 px-4 py-2",
            lg: "h-10 rounded-md px-8",
            icon: "h-9 w-9",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
