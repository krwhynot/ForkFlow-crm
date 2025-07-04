import * as React from 'react';
import { useFilterState, useListContext } from 'react-admin';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';

export const Filter = ({
    label,
    children,
    icon,
}: {
    label: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}) => {
    return (
        <Disclosure>
            {({ open }) => (
                <>
                    <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
                        <div className="flex items-center space-x-2">
                            {icon}
                            <span>{label}</span>
                        </div>
                        <ChevronUpIcon
                            className={`${
                                open ? 'transform rotate-180' : ''
                            } w-5 h-5 text-gray-500`}
                        />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        {children}
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
};

export const FilterItem = ({
    label,
    value,
}: {
    label: string;
    value: any;
}) => {
    const { filterValues, setFilters } = useListContext();

    const handleClick = () => {
        setFilters(value, filterValues);
    };

    return (
        <button
            onClick={handleClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
            {label}
        </button>
    );
};
