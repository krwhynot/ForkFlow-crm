import { useState } from 'react';
import { Chip } from '../components/DataDisplay/Chip';
import { Tag } from '../types';
import { TagEditModal } from './TagEditModal';

type TagChipProps = {
    tag: Tag;
    onUnlink: () => Promise<void>;
};

export function TagChip({ tag, onUnlink }: TagChipProps) {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleClick = () => {
        setOpen(true);
    };

    return (
        <>
            <div className="relative group">
                <Chip
                    size="small"
                    label={tag.name}
                    className="cursor-pointer"
                    style={{ backgroundColor: tag.color }}
                    onClick={handleClick}
                />
                <button
                    onClick={onUnlink}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    &times;
                </button>
            </div>
            <TagEditModal tag={tag} open={open} onClose={handleClose} />
        </>
    );
}
