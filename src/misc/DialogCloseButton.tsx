import { XMarkIcon } from '@heroicons/react/24/outline';

export const DialogCloseButton = ({
    onClose,
    top = 8,
    right = 8,
    color,
}: {
    onClose: () => void;
    top?: number;
    right?: number;
    color?: string;
}) => {
    return (
        <button
            aria-label="close"
            onClick={onClose}
            type="button"
            className={`absolute z-10 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors${color ? ` text-[${color}]` : ' text-gray-500'}`}
            style={{ top, right }}
        >
            <XMarkIcon className="w-5 h-5" />
        </button>
    );
};
