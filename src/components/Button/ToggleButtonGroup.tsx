import React from 'react';
import { twMerge } from 'tailwind-merge';

type ToggleButtonGroupProps = {
    value: any;
    exclusive?: boolean;
    onChange: (event: React.MouseEvent<HTMLElement>, newValue: any) => void;
    children: React.ReactNode;
    className?: string;
};

export const ToggleButtonGroup = ({
    value,
    exclusive,
    onChange,
    children,
    className,
}: ToggleButtonGroupProps) => {
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        buttonValue: any
    ) => {
        if (!exclusive) {
            const newValue = Array.isArray(value) ? [...value] : [];
            const index = newValue.indexOf(buttonValue);
            if (index === -1) {
                newValue.push(buttonValue);
            } else {
                newValue.splice(index, 1);
            }
            onChange(event, newValue);
        } else {
            onChange(event, buttonValue);
        }
    };

    return (
        <div className={twMerge('inline-flex rounded-md shadow-sm', className)}>
            {React.Children.map(children, child => {
                if (!React.isValidElement(child)) {
                    return null;
                }
                const childProps = child.props as {
                    value: any;
                    selected?: boolean;
                };
                return React.cloneElement(child, {
                    selected: exclusive
                        ? value === childProps.value
                        : Array.isArray(value) &&
                          value.includes(childProps.value),
                    onClick: (e: React.MouseEvent<HTMLElement>) =>
                        handleChange(e, childProps.value),
                } as React.Attributes & {
                    selected: boolean;
                    onClick: (e: React.MouseEvent<HTMLElement>) => void;
                });
            })}
        </div>
    );
};
