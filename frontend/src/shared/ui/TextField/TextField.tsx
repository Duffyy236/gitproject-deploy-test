import React from 'react';
import styles from './TextField.module.scss';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    onChange?: (value: string) => void;
}

export default function TextField({ label, id, className, onChange, ...rest }: TextFieldProps) {
    return (
        <div className={`${styles.field} ${className || ''}`}>
            {label && <label htmlFor={id}>{label}</label>}
            <input
                id={id}
                className={styles.input}
                onChange={(e) => onChange?.(e.target.value)} // ✅ on envoie directement la string
                {...rest}
            />
        </div>
    );
}
