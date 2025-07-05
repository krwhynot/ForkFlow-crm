import React, { Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

// Internal context types are not required because we leverage Headless UI Disclosure.

interface AccordionProps {
    children: React.ReactNode;
    className?: string;
    defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
    children,
    className,
    defaultOpen = false,
}) => {
    // Simply render the children inside a Disclosure root so Summary & Details work.
    return (
        <Disclosure defaultOpen={defaultOpen} as="div" className={cn('w-full', className)}>
            {children}
        </Disclosure>
    );
};

interface AccordionSummaryProps {
    children: React.ReactNode;
    className?: string;
    expandIcon?: React.ReactNode;
}

export const AccordionSummary: React.FC<AccordionSummaryProps> = ({
    children,
    className,
    expandIcon,
}) => (
    <Disclosure.Button
        className={cn(
            'flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75',
            className
        )}
    >
        <span>{children}</span>
        {expandIcon ?? <ChevronDownIcon className="h-5 w-5" />}
    </Disclosure.Button>
);

interface AccordionDetailsProps {
    children: React.ReactNode;
    className?: string;
}

export const AccordionDetails: React.FC<AccordionDetailsProps> = ({
    children,
    className,
}) => (
    <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
    >
        <Disclosure.Panel
            className={cn('px-4 pt-2 pb-4 text-sm text-gray-700', className)}
        >
            {children}
        </Disclosure.Panel>
    </Transition>
);

export default Accordion; 