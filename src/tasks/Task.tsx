import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { Fragment, MouseEvent, useState } from 'react';
import {
    DateField,
    ReferenceField,
    useDeleteWithUndoController,
    useUpdate,
} from 'react-admin';
import { TaskEdit } from './TaskEdit';

export const Task = ({
    task,
    showContact,
}: {
    task: any;
    showContact?: boolean;
}) => {
    const [openEdit, setOpenEdit] = useState(false);
    const [update, { isPending: isUpdatePending }] = useUpdate();
    const { handleDelete } = useDeleteWithUndoController({
        record: task,
        redirect: false,
    });

    const handleEdit = () => {
        setOpenEdit(true);
    };

    const handleCheck = () => {
        update('tasks', {
            id: task.id,
            data: {
                done_date: task.done_date ? null : new Date().toISOString(),
            },
            previousData: task,
        });
    };

    const postpone = (days: number) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        update('tasks', {
            id: task.id,
            data: {
                due_date: dueDate.toISOString().slice(0, 10),
            },
            previousData: task,
        });
    };

    const labelId = `checkbox-list-label-${task.id}`;

    return (
        <>
            <li className="flex items-center py-2">
                <div className="flex items-start flex-1">
                    <input
                        id={labelId}
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        checked={!!task.done_date}
                        onChange={handleCheck}
                        disabled={isUpdatePending}
                    />
                    <div
                        className={`ml-3 text-sm ${
                            task.done_date ? 'line-through text-gray-500' : ''
                        }`}
                    >
                        <label
                            htmlFor={labelId}
                            className="font-medium text-gray-900"
                        >
                            {task.type && task.type !== 'None' && (
                                <span className="font-bold">{task.type} </span>
                            )}
                            {task.text}
                        </label>
                        <div className="text-gray-500">
                            due <DateField source="due_date" record={task} />
                            {showContact && (
                                <>
                                    {' '}
                                    (Re:{' '}
                                    <ReferenceField
                                        source="contact_id"
                                        reference="contacts"
                                        record={task}
                                        link="show"
                                    />
                                    )
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Menu as="div" className="relative flex-shrink-0">
                    <Menu.Button className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span className="sr-only">Open options</span>
                        <EllipsisVerticalIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                        />
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => postpone(1)}
                                        className={`${
                                            active ? 'bg-gray-100' : ''
                                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                    >
                                        Postpone to tomorrow
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => postpone(7)}
                                        className={`${
                                            active ? 'bg-gray-100' : ''
                                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                    >
                                        Postpone to next week
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={handleEdit}
                                        className={`${
                                            active ? 'bg-gray-100' : ''
                                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                    >
                                        Edit
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => handleDelete(task)}
                                        className={`${
                                            active ? 'bg-gray-100' : ''
                                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                    >
                                        Delete
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </li>

            {/* This part is for editing the Task directly via a Dialog */}
            <TaskEdit
                taskId={task.id}
                open={openEdit}
                close={() => setOpenEdit(false)}
            />
        </>
    );
};
