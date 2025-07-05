import { Stack, ImageList, ImageListItem } from '@/components/ui-kit';
import { ContactNote, DealNote, RAFile } from '../types';
import { FileField } from 'react-admin';
import { PaperClipIcon } from '@heroicons/react/24/outline';

export const NoteAttachments = ({ note }: { note: ContactNote | DealNote }) => {
    if (!note.attachments || note.attachments.length === 0) {
        return null;
    }

    const imageAttachments = note.attachments.filter((attachment: RAFile) =>
        isImageMimeType(attachment.type)
    );
    const otherAttachments = note.attachments.filter(
        (attachment: RAFile) => !isImageMimeType(attachment.type)
    );

    return (
        <Stack className="flex-col">
            {imageAttachments.length > 0 && (
                <ImageList cols={4} gap={8}>
                    {imageAttachments.map(
                        (attachment: RAFile, index: number) => (
                            <ImageListItem key={index}>
                                <img
                                    src={attachment.src}
                                    alt={attachment.title}
                                    style={{
                                        width: '200px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        objectPosition: 'left',
                                        border: '1px solid #e0e0e0',
                                    }}
                                    onClick={() =>
                                        window.open(attachment.src, '_blank')
                                    }
                                />
                            </ImageListItem>
                        )
                    )}
                </ImageList>
            )}
            {otherAttachments.length > 0 &&
                otherAttachments.map((attachment: RAFile, index: number) => (
                    <Stack key={index} className="flex-row items-center">
                        <PaperClipIcon className="w-4 h-4" />
                        <FileField
                            record={{ attachment }}
                            source="attachment.src"
                            title="attachment.title"
                            target="_blank"
                        />
                    </Stack>
                ))}
        </Stack>
    );
};

const isImageMimeType = (mimeType?: string): boolean => {
    if (!mimeType) {
        return false;
    }
    return mimeType.startsWith('image/');
};
