import React from 'react';
import { twMerge } from 'tailwind-merge';

type TypographyVariant = 
    | 'h1' 
    | 'h2' 
    | 'h3' 
    | 'h4' 
    | 'h5' 
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'button'
    | 'overline'
    | 'inherit';

type TypographyProps = {
    variant?: TypographyVariant;
    component?: React.ElementType;
    className?: string;
    children: React.ReactNode;
    fontFamily?: string;
    color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'text.primary' | 'text.secondary';
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
    gutterBottom?: boolean;
    noWrap?: boolean;
    [key: string]: any;
};

const variantMapping: Record<Exclude<TypographyVariant, 'inherit'>, string> = {
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
    button: 'span',
    overline: 'span',
};

const variantClasses: Record<Exclude<TypographyVariant, 'inherit'>, string> = {
    h1: 'text-6xl font-bold',
    h2: 'text-5xl font-bold',
    h3: 'text-4xl font-bold',
    h4: 'text-3xl font-bold',
    h5: 'text-2xl font-bold',
    h6: 'text-xl font-bold',
    subtitle1: 'text-lg',
    subtitle2: 'text-base',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs',
    button: 'text-sm font-medium uppercase',
    overline: 'text-xs uppercase',
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    (
        {
            variant = 'body1',
            component,
            className,
            children,
            fontFamily,
            color,
            align,
            gutterBottom,
            noWrap,
            ...props
        },
        ref
    ) => {
        const Component =
            component ||
            (variant && variant !== 'inherit'
                ? variantMapping[variant as Exclude<TypographyVariant, 'inherit'>]
                : undefined) ||
            'span';

        // Handle color classes
        const colorClasses = color === 'error' ? 'text-red-600' :
            color === 'warning' ? 'text-orange-600' :
            color === 'info' ? 'text-blue-600' :
            color === 'success' ? 'text-green-600' :
            color === 'text.secondary' ? 'text-gray-600' :
            color === 'primary' ? 'text-blue-600' :
            color === 'secondary' ? 'text-purple-600' :
            '';

        // Handle alignment classes
        const alignClasses = align === 'center' ? 'text-center' :
            align === 'right' ? 'text-right' :
            align === 'justify' ? 'text-justify' :
            '';

        return (
            <Component
                ref={ref}
                className={twMerge(
                    variant && variant !== 'inherit'
                        ? variantClasses[variant as Exclude<TypographyVariant, 'inherit'>]
                        : undefined,
                    colorClasses,
                    alignClasses,
                    gutterBottom && 'mb-2',
                    noWrap && 'whitespace-nowrap overflow-hidden text-ellipsis',
                    className
                )}
                style={{ fontFamily }}
                {...props}
            >
                {children}
            </Component>
        );
    }
);
