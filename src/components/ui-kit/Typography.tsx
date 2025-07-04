import React from 'react';
import { twMerge } from 'tailwind-merge';

const variantMapping = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    overline: 'span',
    button: 'span',
};

const variantClasses = {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
    subtitle1: 'text-base font-medium',
    subtitle2: 'text-sm font-medium',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs',
    overline: 'text-xs uppercase tracking-wider',
    button: 'text-sm font-medium uppercase tracking-wide',
};

const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-success-600',
    error: 'text-error-600',
    warning: 'text-warning-600',
    info: 'text-blue-600',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textDisabled: 'text-gray-400',
    inherit: '',
};

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
};

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: keyof typeof variantMapping;
    color?: keyof typeof colorClasses | 'text.primary' | 'text.secondary' | 'text.disabled';
    align?: keyof typeof alignClasses;
    component?: React.ElementType;
    as?: React.ElementType;
    gutterBottom?: boolean;
    noWrap?: boolean;
    paragraph?: boolean;
    className?: string;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    (
        { 
            variant = 'body1', 
            color = 'textPrimary', 
            align,
            component,
            as, 
            gutterBottom = false,
            noWrap = false,
            paragraph = false,
            className, 
            ...props 
        },
        ref
    ) => {
        // Handle Material-UI style color prop with dots
        let colorKey = color;
        if (color === 'text.primary') colorKey = 'textPrimary';
        if (color === 'text.secondary') colorKey = 'textSecondary';
        if (color === 'text.disabled') colorKey = 'textDisabled';

        const Component = component || as || (paragraph ? 'p' : variantMapping[variant]) || 'p';
        
        const classes = twMerge(
            'text-gray-900', // default color
            variantClasses[variant],
            colorClasses[colorKey as keyof typeof colorClasses],
            align && alignClasses[align],
            gutterBottom && 'mb-4',
            noWrap && 'whitespace-nowrap overflow-hidden text-ellipsis',
            className
        );

        return <Component ref={ref} className={classes} {...props} />;
    }
);

Typography.displayName = 'Typography';
