import { useDispatch, useSelector } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
import { useState, useEffect } from 'react';
import { setPageTitle } from '../../../_theme/themeConfigSlice';
import IconCalendar from '../../../_theme/components/Icon/IconCalendar';
import IconInstagram from '../../../_theme/components/Icon/IconInstagram';
import IconEdit from '../../../_theme/components/Icon/IconEdit';
import IconTrashLines from '../../../_theme/components/Icon/IconTrashLines';
import { ITask } from './models/task';
import { Avatar, Badge, Tooltip } from '@mantine/core';
import { colors } from '../../shared/utils/utils';
import { IRootState } from '../../store';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import Swal from 'sweetalert2';

export interface ITaskBoardCard {
    id: number;
    title: string;
    tasks: ITask[];
}

const ScrumBoard = ({
    data,
    openEditModal,
    openDeleteModal,
    handleDragEnd,
}: {
    data: ITaskBoardCard[];
    openEditModal: (id: number) => void;
    openDeleteModal: (id: number) => void;
    handleDragEnd: (taskId: number, newStatusId: number) => void;
}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Scrumboard'));
    });

    const [boardCardList, setBoardCardList] = useState<ITaskBoardCard[]>(data);

    useEffect(() => {
        setBoardCardList(data);
    }, [data]);

    const addEditTask = (projectId: any, task: ITask) => {
        openEditModal(task.id);
    };

    const deleteConfirmModal = (projectId: any, task: any = null) => {
        openDeleteModal(task.id);
    };

    const auth = useSelector((state: IRootState) => state.auth);
    const editPermission = auth.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Edit Task'));
    const deletePermission = auth.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Delete Task'));

    const reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const move = (sourceList: any[], destList: any[], sourceIndex: number, destIndex: number) => {
        const sourceClone = Array.from(sourceList);
        const destClone = Array.from(destList);
        const [moved] = sourceClone.splice(sourceIndex, 1);
        destClone.splice(destIndex, 0, moved);
        return { source: sourceClone, destination: destClone, movedItem: moved };
    };
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const prevState = JSON.parse(JSON.stringify(boardCardList));

        const sourceDroppableId = source.droppableId;
        const destDroppableId = destination.droppableId;

        const sourceProjectIndex = boardCardList.findIndex((p) => String(p.id) === String(sourceDroppableId));
        const destProjectIndex = boardCardList.findIndex((p) => String(p.id) === String(destDroppableId));

        if (sourceProjectIndex === -1 || destProjectIndex === -1) return;

        let newBoard = [...boardCardList];

        if (sourceDroppableId === destDroppableId) {
            const project = boardCardList[sourceProjectIndex];
            const newTasks = reorder(project.tasks ?? [], source.index, destination.index);

            newBoard = newBoard.map((p, idx) => {
                if (idx === sourceProjectIndex) return { ...p, tasks: newTasks };
                return p;
            });

            setBoardCardList(newBoard);
        } else {
            const sourceProject = boardCardList[sourceProjectIndex];
            const destProject = boardCardList[destProjectIndex];

            const { source: newSourceTasks, destination: newDestTasks } = move(sourceProject.tasks ?? [], destProject.tasks ?? [], source.index, destination.index);

            newBoard = newBoard.map((p, idx) => {
                if (idx === sourceProjectIndex) return { ...p, tasks: newSourceTasks };
                if (idx === destProjectIndex) return { ...p, tasks: newDestTasks };
                return p;
            });

            setBoardCardList(newBoard);
        }

        try {
            const taskId = Number(draggableId);
            const newStatusId = Number(destDroppableId);

            await handleDragEnd(taskId, newStatusId);
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: err?.data?.message || err?.message || 'Something went wrong',
            });

            setBoardCardList(prevState);
        }
    };

    return (
        <div>
            {/* project list  */}
            <div className="relative pt-5">
                <div className="perfect-scrollbar h-full -mx-2">
                    <div className="overflow-x-auto grid grid-cols-3  gap-5 pb-2 px-2">
                        <DragDropContext onDragEnd={onDragEnd}>
                            {boardCardList.map((project) => {
                                return (
                                    <Droppable droppableId={String(project.id)} key={project.id}>
                                        {(providedDroppable) => (
                                            <div
                                                ref={providedDroppable.innerRef}
                                                {...providedDroppable.droppableProps}
                                                className="panel flex-none bg-[#f4f4f4]/50 shadow-none rounded-2xl"
                                                data-group={project.id}
                                            >
                                                <div className="flex justify-between mb-5">
                                                    <h4 className="text-base font-semibold">{project.title}</h4>
                                                </div>

                                                <div className="connect-sorting-content min-h-[150px]">
                                                    {(project.tasks ?? []).map((task, index) => {
                                                        return (
                                                            <Draggable draggableId={String(task.id)} index={index} key={String(project.id) + '' + String(task.id)}>
                                                                {(providedDraggable, snapshot) => (
                                                                    <div
                                                                        ref={providedDraggable.innerRef}
                                                                        {...providedDraggable.draggableProps}
                                                                        {...providedDraggable.dragHandleProps}
                                                                        data-task={task.id}
                                                                        className="sortable-list"
                                                                    >
                                                                        <div className=" bg-white dark:bg-white-dark/20 p-3 pb-5 rounded-xl mb-5 space-y-3 cursor-move">
                                                                            <div className="text-base font-medium break-all line-clamp-3">{task.title}</div>
                                                                            <p className="break-all line-clamp-3">{task.description}</p>
                                                                            <div className="flex gap-2 items-center flex-wrap">
                                                                                {task.status?.length ? (
                                                                                    <>
                                                                                        <Badge
                                                                                            className="capitalize"
                                                                                            color={
                                                                                                task.status === 'COMPLETED'
                                                                                                    ? 'green'
                                                                                                    : task.status === 'IN_PROGRESS'
                                                                                                    ? 'blue'
                                                                                                    : task.status === 'TODO'
                                                                                                    ? 'orange'
                                                                                                    : task.status === 'CANCELED'
                                                                                                    ? 'red'
                                                                                                    : task.status === 'ARCHIVED'
                                                                                                    ? 'gray'
                                                                                                    : ''
                                                                                            }
                                                                                            variant="light"
                                                                                            size="lg"
                                                                                        >
                                                                                            {task.status
                                                                                                .split('_')
                                                                                                .map((word) => word.toLowerCase())
                                                                                                .join(' ')}
                                                                                        </Badge>
                                                                                        <Badge
                                                                                            className="capitalize"
                                                                                            color={
                                                                                                task.priority === 'HIGH'
                                                                                                    ? 'red'
                                                                                                    : task.priority === 'MEDIUM'
                                                                                                    ? 'yellow'
                                                                                                    : task.priority === 'LOW'
                                                                                                    ? 'gray'
                                                                                                    : ''
                                                                                            }
                                                                                            variant="light"
                                                                                            size="lg"
                                                                                        >
                                                                                            {task.priority.toLowerCase()}
                                                                                        </Badge>
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="btn px-2 py-1 flex text-white-dark dark:border-white-dark/50 shadow-none">
                                                                                        <IconInstagram className="shrink-0" />
                                                                                        <span className="ltr:ml-2 rtl:mr-2">No Tags</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                {task.leads.slice(0, 5).map((lead, idx) => {
                                                                                    return (
                                                                                        <div
                                                                                            key={lead.id}
                                                                                            className="flex items-center mt-2"
                                                                                            style={{ marginLeft: idx > 0 ? '-5px' : '0px', zIndex: idx }}
                                                                                        >
                                                                                            <Tooltip label={lead.firstName + ' ' + (lead.lastName ? lead.lastName : '')} withArrow>
                                                                                                <Avatar
                                                                                                    size={30}
                                                                                                    radius="xl"
                                                                                                    color={
                                                                                                        colors[
                                                                                                            ((lead.firstName?.charCodeAt(0) ?? 0) + (lead.lastName?.charCodeAt(0) ?? 0)) % colors.length
                                                                                                        ]
                                                                                                    }
                                                                                                    className="ring-2 ring-white dark:ring-white-dark/50"
                                                                                                    sx={(theme) => ({
                                                                                                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.blue[7] : theme.colors.blue[0],
                                                                                                    })}
                                                                                                >
                                                                                                    {lead.firstName?.charAt(0).toUpperCase()}
                                                                                                    {lead.lastName?.charAt(0).toUpperCase()}
                                                                                                </Avatar>
                                                                                            </Tooltip>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                                {task.leads.length > 5 && (
                                                                                    <div className="flex items-center mt-2" style={{ marginLeft: '-8px', zIndex: 20 }}>
                                                                                        <Tooltip label={`+${task.leads.length - 5} more`} withArrow>
                                                                                            <Avatar size={30} radius="xl" className="ring-2 ring-white dark:ring-white-dark/50" color="teal">
                                                                                                +{task.leads.length - 5}
                                                                                            </Avatar>
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex items-center justify-between">
                                                                                <div className="font-medium flex items-center hover:text-primary">
                                                                                    <IconCalendar className="ltr:mr-3 rtl:ml-3 shrink-0" />
                                                                                    <span>{task.dueDate}</span>
                                                                                </div>
                                                                                <div className="flex items-center">
                                                                                    {editPermission && (
                                                                                        <button onClick={() => addEditTask(project.id, task)} type="button" className="hover:text-info">
                                                                                            <IconEdit className="ltr:mr-3 rtl:ml-3" />
                                                                                        </button>
                                                                                    )}
                                                                                    {deletePermission && (
                                                                                        <button onClick={() => deleteConfirmModal(project.id, task)} type="button" className="hover:text-danger">
                                                                                            <IconTrashLines />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    })}
                                                    {providedDroppable.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                );
                            })}
                        </DragDropContext>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrumBoard;
