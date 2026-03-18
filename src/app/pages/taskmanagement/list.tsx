import { Alert } from '@mantine/core';
import { FC, lazy } from 'react';
import { useSelector } from 'react-redux';
import IconX from '../../../_theme/components/Icon/IconX';
import { useGetTasksQuery } from '../../features/TaskManagement/services/tasksApi';
import Fallback from '../../shared/components/ui/Fallback';
import Show from '../../shared/helpers/Show';
import { IRootState } from '../../store';

const TaskManagement = lazy(() => import('../../features/TaskManagement/TaskManagement'));

function TaskList(): ReturnType<FC> {
    const { data: tasksData, isFetching: isTasksFetching, isLoading: isTasksLoading, isError: isTasksError, error: tasksError } = useGetTasksQuery();

    const tasksSlice = useSelector((state: IRootState) => state.tasks.tasks);
    const title = 'Tasks';

    return (
        <>
            {isTasksLoading ? (
                <Fallback title={title} />
            ) : (
                <>
                    <Show
                        when={isTasksError}
                        show={
                            <Alert icon={<IconX />} variant="filled" title="Error" color="red">
                                {(tasksError as any)?.message || 'Something went wrong, Please try again later'}
                            </Alert>
                        }
                    />
                    {/* Ensure the `TaskManagement` component is passed the correct data */}
                    <TaskManagement tasks={tasksData?.data?.tasks ?? []} fetching={isTasksFetching} />
                </>
            )}
        </>
    );
}

export default TaskList;
