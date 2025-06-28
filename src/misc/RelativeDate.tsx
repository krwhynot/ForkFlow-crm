import { formatRelative } from 'date-fns';

export function RelativeDate({ date }: { date: string | null | undefined }) {
    if (!date) {
        return 'Unknown date';
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return 'Invalid date';
    }

    return formatRelative(parsedDate, new Date());
}
