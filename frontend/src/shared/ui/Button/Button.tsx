import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export default function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
    return (
        <button className={`${styles.button} ${styles[variant]} ${className || ''}`} {...rest}>
            {children}
        </button>
    );
}
