import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassButtonProps extends HTMLMotionProps<"button"> {
    active?: boolean;
    variant?: 'primary' | 'ghost' | 'danger';
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    active,
    variant = 'ghost',
    icon,
    children,
    className = '',
    style,
    ...props
}) => {

    const getVariantStyles = () => {
        if (variant === 'primary') {
            return {
                background: 'var(--accent-primary)',
                color: 'black',
                border: '1px solid var(--accent-primary)',
                boxShadow: '0 0 10px rgba(0, 224, 255, 0.3)'
            };
        }
        if (active) {
            return {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            };
        }
        return {
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid transparent'
        };
    };

    return (
        <motion.button
            whileHover={{
                scale: 1.02,
                backgroundColor: variant === 'primary' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: variant === 'primary' ? 'black' : 'white',
                borderColor: variant === 'primary' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'
            }}
            whileTap={{ scale: 0.96 }}
            style={{
                ...getVariantStyles(),
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.1s', // fast color transition, motion handles layout
                ...style
            }}
            className={`glass-button ${className}`}
            {...props}
        >
            {icon && <span style={{ display: 'flex' }}>{icon}</span>}
            {children}
        </motion.button>
    );
};
