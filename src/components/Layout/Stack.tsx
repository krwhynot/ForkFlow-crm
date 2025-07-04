import React from 'react';
import { twMerge } from 'tailwind-merge';

type StackProps = {
    direction?: 'row' | 'col';
    gap?: number;
    spacing?: number;
    justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around';
    alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
    className?: string;
    children: React.ReactNode;
    component?: React.ElementType;
    style?: React.CSSProperties;
};

export const Stack = ({
    direction = 'col',
    gap = 0,
    spacing = 0,
    justifyContent,
    alignItems,
    className,
    children,
    component: Component = 'div',
    style,
    ...props
}: StackProps) => {
    const gapValue = gap || spacing;
    return (
        <Component
            className={twMerge(
                'flex',
                `flex-${direction}`,
                `gap-${gapValue}`,
                justifyContent && `justify-${justifyContent}`,
                alignItems && `items-${alignItems}`,
                className
            )}
            style={style}
            {...props}
        >
            {children}
        </Component>
    );
};
