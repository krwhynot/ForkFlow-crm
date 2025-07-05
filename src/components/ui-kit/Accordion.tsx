import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

export interface AccordionProps {
    children: React.ReactNode;
    expanded?: boolean;
    onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
    disabled?: boolean;
    className?: string;
    elevation?: number;
    square?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
    children,
    expanded,
    onChange,
    disabled = false,
    className,
    elevation = 1,
    square = false,
}) => {
    const isControlled = expanded !== undefined;
    const [internalExpanded, setInternalExpanded] = React.useState(false);
    const isExpanded = isControlled ? expanded : internalExpanded;

    const handleToggle = () => {
        if (disabled) return;
        
        const newExpanded = !isExpanded;
        if (!isControlled) {
            setInternalExpanded(newExpanded);
        }
        onChange?.(new Event('change') as any, newExpanded);
    };

    const accordionClasses = twMerge(
        'border border-gray-200 bg-white overflow-hidden transition-all duration-200',
        !square && 'rounded-lg',
        elevation === 1 && 'shadow-sm',
        elevation === 2 && 'shadow',
        elevation === 3 && 'shadow-md',
        elevation >= 4 && 'shadow-lg',
        disabled && 'opacity-50 cursor-not-allowed',
        className
    );

    return (
        <Disclosure>
            {({ open }) => (
                <div className={accordionClasses}>
                    {React.Children.map(children, (child, index) => {
                        if (React.isValidElement(child)) {
                            if (child.type === AccordionSummary) {
                                return React.cloneElement(child as any, {
                                    expanded: isExpanded,
                                    onToggle: handleToggle,
                                    disabled,
                                });
                            } else if (child.type === AccordionDetails) {
                                return React.cloneElement(child as any, {
                                    expanded: isExpanded,
                                });
                            }
                        }
                        return child;
                    })}
                </div>
            )}
        </Disclosure>
    );
};

export interface AccordionSummaryProps {
    children: React.ReactNode;
    expandIcon?: React.ReactNode;
    expanded?: boolean;
    onToggle?: () => void;
    disabled?: boolean;
    className?: string;
}

export const AccordionSummary: React.FC<AccordionSummaryProps> = ({
    children,
    expandIcon,
    expanded = false,
    onToggle,
    disabled = false,
    className,
}) => {
    const summaryClasses = twMerge(
        'flex items-center justify-between w-full px-4 py-3',
        'text-left font-medium transition-colors duration-200',
        'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'min-h-[48px] cursor-pointer',
        disabled && 'cursor-not-allowed hover:bg-white',
        className
    );

    const iconClasses = twMerge(
        'transition-transform duration-200 ease-in-out',
        expanded && 'rotate-180'
    );

    return (
        <Disclosure.Button
            as="button"
            className={summaryClasses}
            onClick={onToggle}
            disabled={disabled}
        >
            <div className="flex items-center flex-1">
                {children}
            </div>
            <div className={iconClasses}>
                {expandIcon || <ChevronDownIcon className="w-5 h-5" />}
            </div>
        </Disclosure.Button>
    );
};

export interface AccordionDetailsProps {
    children: React.ReactNode;
    expanded?: boolean;
    className?: string;
}

export const AccordionDetails: React.FC<AccordionDetailsProps> = ({
    children,
    expanded = false,
    className,
}) => {
    const detailsClasses = twMerge(
        'px-4 pb-4',
        className
    );

    return (
        <Transition
            show={expanded}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 max-h-0"
            enterTo="opacity-100 max-h-screen"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 max-h-screen"
            leaveTo="opacity-0 max-h-0"
        >
            <div className={detailsClasses}>
                {children}
            </div>
        </Transition>
    );
};

// AccordionActions for consistency with Material-UI
export interface AccordionActionsProps {
    children: React.ReactNode;
    className?: string;
    disableSpacing?: boolean;
}

export const AccordionActions: React.FC<AccordionActionsProps> = ({
    children,
    className,
    disableSpacing = false,
}) => {
    const actionsClasses = twMerge(
        'flex items-center px-4 py-2',
        !disableSpacing && 'gap-2',
        className
    );

    return (
        <div className={actionsClasses}>
            {children}
        </div>
    );
};