import * as React from 'react';
import {
    DateInput,
    DeleteButton,
    EditBase,
    Form,
    required,
    SaveButton,
    SelectInput,
    TextInput,
    Toolbar,
    useNotify,
} from 'react-admin';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Modal } from '../components/ui-kit/Modal';
import { Button } from '../components/ui-kit/Button';

export const TaskEdit = ({
    open,
    close,
    taskId,
}: {
    taskId: string;
    open: boolean;
    close: () => void;
}) => {
    const { taskTypes } = useConfigurationContext();
    const notify = useNotify();
    return (
        <Modal isOpen={open} onClose={close} title="Edit task">
            <EditBase
                id={taskId}
                resource="tasks"
                mutationOptions={{
                    onSuccess: () => {
                        close();
                        notify('Task updated', {
                            type: 'info',
                            undoable: true,
                        });
                    },
                }}
                redirect={false}
            >
                <Form>
                    <div className="p-4">
                        <TextInput
                            autoFocus
                            source="text"
                            label="Description"
                            validate={required()}
                            multiline
                            className="w-full"
                        />
                        <div className="flex space-x-4 mt-4">
                            <DateInput
                                source="due_date"
                                validate={required()}
                            />
                            <SelectInput
                                source="type"
                                validate={required()}
                                choices={taskTypes.map(type => ({
                                    id: type,
                                    name: type,
                                }))}
                            />
                        </div>
                    </div>
                    <Toolbar>
                        <div className="flex justify-between w-full">
                            <SaveButton label="Save" />
                            <DeleteButton
                                label="Delete"
                                mutationOptions={{
                                    onSuccess: () => {
                                        close();
                                        notify('Task deleted', {
                                            type: 'info',
                                            undoable: true,
                                        });
                                    },
                                }}
                                redirect={false}
                            />
                        </div>
                    </Toolbar>
                </Form>
            </EditBase>
        </Modal>
    );
};
