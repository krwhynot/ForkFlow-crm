import { twMerge } from 'tailwind-merge';

export type LinearProgressProps = {
    variant?: 'determinate';
    value: number;
    className?: string;
};

export const LinearProgress = ({
    variant = 'determinate',
    value,
    className,
}: LinearProgressProps) => {
    return (
        <div
            className={twMerge(
                'h-1 bg-gray-200 rounded-full overflow-hidden',
                className
            )}
        >
            <div
                className="h-full bg-blue-500"
                style={{ width: `${value}%` }}
            />
        </div>
    );
};
