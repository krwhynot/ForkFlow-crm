import React from 'react';
import { Tab } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface TabItem {
    label: string;
    value?: string | number;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export interface TabsProps {
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string | number) => void;
    children?: React.ReactNode;
    tabs?: TabItem[];
    variant?: 'standard' | 'scrollable' | 'fullWidth';
    orientation?: 'horizontal' | 'vertical';
    centered?: boolean;
    className?: string;
    indicatorColor?: 'primary' | 'secondary';
    textColor?: 'primary' | 'secondary' | 'inherit';
}

export const Tabs: React.FC<TabsProps> = ({
    value,
    defaultValue,
    onChange,
    children,
    tabs = [],
    variant = 'standard',
    orientation = 'horizontal',
    centered = false,
    className,
    indicatorColor = 'primary',
    textColor = 'primary',
}) => {
    const isControlled = value !== undefined;
    const [selectedIndex, setSelectedIndex] = React.useState(() => {
        if (tabs.length === 0) return 0;
        const initialValue = isControlled ? value : defaultValue;
        const index = tabs.findIndex(tab => tab.value === initialValue);
        return index >= 0 ? index : 0;
    });

    React.useEffect(() => {
        if (isControlled && tabs.length > 0) {
            const index = tabs.findIndex(tab => tab.value === value);
            if (index >= 0) {
                setSelectedIndex(index);
            }
        }
    }, [value, tabs, isControlled]);

    const handleChange = (index: number) => {
        if (!isControlled) {
            setSelectedIndex(index);
        }
        if (onChange && tabs[index]) {
            onChange(tabs[index].value || index);
        }
    };

    const tabListClasses = twMerge(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        variant === 'fullWidth' && 'w-full',
        variant === 'scrollable' && 'overflow-x-auto',
        centered && 'justify-center',
        'border-b border-gray-200',
        className
    );

    const tabClasses = (selected: boolean, disabled: boolean) => twMerge(
        'px-4 py-2 text-sm font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'min-h-[44px] min-w-[44px] flex items-center justify-center gap-2',
        variant === 'fullWidth' && 'flex-1',
        selected ? (
            textColor === 'primary' ? 'text-blue-600' : 
            textColor === 'secondary' ? 'text-gray-800' : 
            'text-inherit'
        ) : 'text-gray-500 hover:text-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        'relative'
    );

    const indicatorClasses = twMerge(
        'absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300',
        indicatorColor === 'primary' ? 'bg-blue-600' : 'bg-gray-800'
    );

    if (React.Children.count(children) > 0) {
        // Support for custom Tab children
        return <div className={className}>{children}</div>;
    }

    return (
        <Tab.Group selectedIndex={selectedIndex} onChange={handleChange}>
            <Tab.List className={tabListClasses}>
                {tabs.map((tab, index) => (
                    <Tab
                        key={tab.value || index}
                        disabled={tab.disabled}
                        className={({ selected }) => tabClasses(selected, tab.disabled || false)}
                    >
                        {({ selected }) => (
                            <>
                                {tab.icon}
                                {tab.label}
                                {selected && <div className={indicatorClasses} />}
                            </>
                        )}
                    </Tab>
                ))}
            </Tab.List>
        </Tab.Group>
    );
};

export interface TabPanelProps {
    value: string | number;
    index: string | number;
    children: React.ReactNode;
    className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
    value,
    index,
    children,
    className,
}) => {
    if (value !== index) {
        return null;
    }

    return (
        <div
            role="tabpanel"
            className={twMerge('py-4', className)}
        >
            {children}
        </div>
    );
};

// Individual Tab component for custom usage
export interface TabProps {
    label: string;
    value?: string | number;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const TabItem: React.FC<TabProps> = ({
    label,
    value,
    disabled = false,
    icon,
    className,
    onClick,
}) => {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={twMerge(
                'px-4 py-2 text-sm font-medium transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                'min-h-[44px] min-w-[44px] flex items-center justify-center gap-2',
                'text-gray-500 hover:text-gray-700',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {icon}
            {label}
        </button>
    );
};

// TabContext for advanced usage
export const TabContext = React.createContext<{
    value: string | number;
    onChange: (value: string | number) => void;
} | null>(null);

export const useTabContext = () => {
    const context = React.useContext(TabContext);
    if (!context) {
        throw new Error('useTabContext must be used within a TabContext');
    }
    return context;
};