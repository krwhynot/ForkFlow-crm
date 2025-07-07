import { useQuery } from '@tanstack/react-query';
import { Identifier, useDataProvider } from 'react-admin';

import { CrmDataProvider } from '../providers/types';
import { ActivityLogContext } from './ActivityLogContext';
import { ActivityLogIterator } from './ActivityLogIterator';
import { Spinner } from '../components/core/forms';

type ActivityLogProps = {
    companyId?: Identifier;
    pageSize?: number;
    context?: 'company' | 'contact' | 'deal' | 'all';
};

export function ActivityLog({
    companyId,
    pageSize = 20,
    context = 'all',
}: ActivityLogProps) {
    const dataProvider = useDataProvider<CrmDataProvider>();
    const { data, isPending, error } = useQuery({
        queryKey: ['activityLog', companyId],
        queryFn: () => dataProvider.getActivityLog(companyId),
    });

    if (isPending) {
        return (
            <div className="flex justify-center my-8">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
                role="alert"
            >
                <p className="font-bold">Error</p>
                <p>Failed to load activity log.</p>
            </div>
        );
    }

    return (
        <ActivityLogContext.Provider value={context}>
            <ActivityLogIterator activities={data} pageSize={pageSize} />
        </ActivityLogContext.Provider>
    );
}
