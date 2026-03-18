import { Button, Loader } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useUpdateTaskMutation } from '../../features/TaskManagement/services/tasksApi';
import AddTaskBody from './components/forms/AddTask';
import DeleteTaskBody from './components/forms/DeleteTask';
import EditTaskBody from './components/forms/EditTask';
import ScrumBoard from './ScrumBoard';
import { ITask } from './models/task';
import Modal from '../../shared/components/ui/modals/modal/Modal';
import ModalBody from '../../shared/components/ui/modals/modal/ModalBody';
import ModalHeader from '../../shared/components/ui/modals/modal/ModalHeader';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';

interface TaskManagementProps {
    tasks: ITask[];
    fetching: boolean;
}

function TaskManagement({ tasks = [], fetching }: TaskManagementProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const [updateTaskMutation] = useUpdateTaskMutation();

    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);

    const openDeleteModal = (taskId: number) => {
        setSelectedTaskId(taskId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setSelectedTaskId(null);
        setIsDeleteModalOpen(false);
    };

    const openEditModal = (taskId: number) => {
        setSelectedTaskId(taskId);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSelectedTaskId(null);
        setIsEditModalOpen(false);
    };

    const handleDragEnd = async (taskId: number, newStatusId: number) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId);
        if (!taskToUpdate) return;

        const updatedTask = { ...taskToUpdate, status: status[newStatusId - 1] };

        try {
            const res = await updateTaskMutation({
                taskId: taskToUpdate.id,
                formData: {
                    leads: updatedTask.leads.map((lead) => lead.id),
                    title: updatedTask.title,
                    description: updatedTask.description,
                    status: updatedTask.status,
                    priority: updatedTask.priority,
                    dueDate: updatedTask.dueDate,
                },
            }).unwrap();

            if (!res.success) {
                throw new Error(res.message || 'Failed to update task');
            }
        } catch (err) {
            throw err;
        }
    };

    const status = useMemo(() => {
        return ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    }, []);

    const [cards, setCards] = useState<any[]>([
        {
            id: 1,
            title: 'In Progress',
            tasks: [],
        },
        {
            id: 2,
            title: 'Pending',
            tasks: [],
        },
        {
            id: 3,
            title: 'Complete',
            tasks: [],
        },
    ]);

    useEffect(() => {
        const formattedCards = status.map((status, index) => {
            const tasksForStatus = tasks
                .filter((task) => task.status === status)
                .map((task) => ({
                    ...task,
                    leads: task.leads || [],
                }));

            return {
                id: index + 1,
                title: status
                    .toLowerCase()
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '),
                tasks: tasksForStatus ?? [],
            };
        });
        setCards(formattedCards);
    }, [tasks, status]);

    const auth = useSelector((state: IRootState) => state.auth);
    const addPermission = auth.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Add Task'));

    return (
        <div className="p-6 relative bg-white min-h-[calc(100vh-50px)]">
            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                <h5 className="font-semibold font-inter text-lg dark:text-black">Tasks</h5>
                <div className="ltr:ml-auto rtl:mr-auto flex gap-4">
                    <div className="w-full flex items-center justify-between gap-4">
                        {addPermission && (
                            <Button
                                onClick={openAddModal}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold px-4 py-5 rounded-xl shadow-md flex items-center gap-2 transition-all duration-300"
                            >
                                Add New Task
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div className="relative">
                {fetching && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-50 flex items-center justify-center">
                        <Loader size="xl" color="blue" />
                    </div>
                )}
                <ScrumBoard data={cards} openEditModal={openEditModal} openDeleteModal={openDeleteModal} handleDragEnd={handleDragEnd} />
            </div>
            <Modal isOpen={isAddModalOpen} close={closeAddModal}>
                <ModalHeader title="Add Task" />
                <ModalBody>
                    <AddTaskBody close={closeAddModal} />
                </ModalBody>
            </Modal>
            {selectedTaskId && (
                <Modal isOpen={isDeleteModalOpen} close={closeDeleteModal}>
                    <ModalBody>
                        <DeleteTaskBody close={closeDeleteModal} taskId={selectedTaskId} />
                    </ModalBody>
                </Modal>
            )}
            {selectedTaskId !== null && (
                <Modal isOpen={isEditModalOpen} close={closeEditModal}>
                    <ModalHeader title="Edit Task" />

                    <ModalBody>
                        <EditTaskBody
                            close={closeEditModal}
                            taskId={selectedTaskId}
                            data={tasks.find((task) => task.id === selectedTaskId) as ITask}
                            leads={tasks.find((task) => task.id === selectedTaskId)?.leads?.map((lead: any) => lead.value) || []}
                        />
                    </ModalBody>
                </Modal>
            )}
        </div>
    );
}

export default TaskManagement;
