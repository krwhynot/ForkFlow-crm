import { IconButton } from '@/components/ui-kit';
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
        <IconButton
            aria-label="close"
            onClick={onClose}
            className="absolute"
            style={{
                right: `${right}px`,
                top: `${top}px`,
                color: color || '#6b7280',
            }}
        >
            <XMarkIcon className="w-5 h-5" />
        </IconButton>
    );
};
