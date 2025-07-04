import {
    ListContextProvider,
    ResourceContextProvider,
    useGetIdentity,
    useGetList,
    useList,
} from 'react-admin';

import { TasksIterator } from '../tasks/TasksIterator';

export const TasksListFilter = ({
    title,
    filter,
}: {
    title: string;
    filter: any;
}) => {
    const { identity } = useGetIdentity();

    const {
        data: tasks,
        total,
        isPending,
    } = useGetList(
        'tasks',
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'due_date', order: 'ASC' },
            filter: {
                ...filter,
                salesId: identity?.id,
            },
        },
        { enabled: !!identity }
    );

    const listContext = useList({
        data: tasks,
        isPending,
        resource: 'tasks',
        perPage: 5,
    });

    if (isPending || !tasks || !total) return null;

    return (
        <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {title}
            </h3>
            <ResourceContextProvider value="tasks">
                <ListContextProvider value={listContext}>
                    <TasksIterator showContact />
                </ListContextProvider>
            </ResourceContextProvider>
            {total > listContext.perPage && (
                <div className="flex justify-end mt-2">
                    <button
                        onClick={e => {
                            listContext.setPerPage(listContext.perPage + 10);
                            e.preventDefault();
                        }}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
};
