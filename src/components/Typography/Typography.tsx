import React from 'react';
import { twMerge } from 'tailwind-merge';

import { OverridableStringUnion } from '@mui/types';
import { Variant } from '@mui/material/styles/createTypography';
import { TypographyPropsVariantOverrides } from '@mui/material/Typography';

type TypographyProps = {
    variant?: OverridableStringUnion<Variant | 'inherit', TypographyPropsVariantOverrides>;
    component?: React.ElementType;
    className?: string;
    children: React.ReactNode;
    fontFamily?: any;
};

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
    button: 'span',
    overline: 'span',
};

const variantClasses = {
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
            ...props
        },
        ref
    ) => {
        const Component =
            component ||
            (variant && variant !== 'inherit'
                ? variantMapping[variant]
                : undefined) ||
            'span';

        return (
            <Component
                ref={ref}
                className={twMerge(
                    variant && variant !== 'inherit'
                        ? variantClasses[variant]
                        : undefined,
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
