import { ReactNode, Fragment } from 'react';

type ActivityLogContactNoteCreatedProps = {
    header: ReactNode;
    text: string;
};

export function ActivityLogNote({
    header,
    text,
}: ActivityLogContactNoteCreatedProps) {
    if (!text) {
        return null;
    }
    const paragraphs = text.split('\n');

    return (
        <div className="flex flex-col space-y-2 w-full">
            <div className="flex items-start space-x-2 w-full">{header}</div>
            <div>
                <p className="text-sm text-gray-700 line-clamp-3">
                    {paragraphs.map((paragraph: string, index: number) => (
                        <Fragment key={index}>
                            {paragraph}
                            {index < paragraphs.length - 1 && <br />}
                        </Fragment>
                    ))}
                </p>
            </div>
        </div>
    );
}
