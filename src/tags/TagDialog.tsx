import ContentSave from '@mui/icons-material/Save';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui-kit';
import { FormEvent, useEffect, useState } from 'react';
import { Toolbar } from 'react-admin';
import { DialogCloseButton } from '../misc/DialogCloseButton';
import { Tag } from '../types';
import { colors } from './colors';
import { RoundButton } from './RoundButton';

type TagDialogProps = {
    open: boolean;
    tag?: Pick<Tag, 'name' | 'color'>;
    title: string;
    onSubmit(tag: Pick<Tag, 'name' | 'color'>): Promise<void>;
    onClose(): void;
};

export function TagDialog({
    open,
    tag,
    title,
    onClose,
    onSubmit,
}: TagDialogProps) {
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(colors[0]);
    const [disabled, setDisabled] = useState(false);

    const handleNewTagNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewTagName(event.target.value);
    };

    const handleClose = () => {
        setDisabled(false);
        onClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await onSubmit({ name: newTagName, color: newTagColor });

        setDisabled(true);
        setNewTagName('');
        setNewTagColor(colors[0]);

        handleClose();
    };

    useEffect(() => {
        setNewTagName(tag?.name ?? '');
        setNewTagColor(tag?.color ?? colors[0]);
    }, [tag]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
        >
            <form onSubmit={handleSubmit}>
                <DialogCloseButton onClose={handleClose} />
                <DialogTitle id="form-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <input
                        autoFocus
                        placeholder="Tag name"
                        value={newTagName}
                        onChange={handleNewTagNameChange}
                        className="mt-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                    <div className="flex flex-wrap w-58 mt-2">
                        {colors.map(color => (
                            <RoundButton
                                key={color}
                                color={color}
                                selected={color === newTagColor}
                                handleClick={() => {
                                    setNewTagColor(color);
                                }}
                            />
                        ))}
                    </div>
                </DialogContent>
                <div className="flex justify-start p-4 border-t border-gray-200">
                    <Button
                        type="submit"
                        color="primary"
                        disabled={disabled}
                        variant="contained"
                        startIcon={<ContentSave />}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
