import { Tooltip } from '@/components/ui-kit';
import { useConfigurationContext } from '../root/ConfigurationContext';

export const Status = ({ status }: { status: string }) => {
    const { noteStatuses } = useConfigurationContext();
    if (!status || !noteStatuses) return null;
    const statusObject = noteStatuses.find((s: any) => s.value === status);

    if (!statusObject) return null;
    return (
        <Tooltip title={(statusObject as any)?.label ?? ''} placement="top">
            <span
                className="ml-1 inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: (statusObject as any)?.color ?? 'inherit' }}
            />
        </Tooltip>
    );
};
