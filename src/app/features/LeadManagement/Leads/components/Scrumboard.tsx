import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import BoardCard from './BoardCard';
import { setPageTitle } from '../../../../../_theme/themeConfigSlice';
import { IRootState } from '../../../../store';
import { ILead } from '../models/lead';

export interface ILeadBoardCard {
    id: number;
    title: string;
    leads: ILead[];
}

const ScrumBoard = ({
    data,
    openEditModal,
    openDeleteModal,
    handleDragEnd,
    updateBoardTitle,
}: {
    data: ILeadBoardCard[];
    openEditModal: (id: number) => void;
    openDeleteModal: (id: number) => void;
    handleDragEnd: (leadId: number, newStatusId: number) => void;
    updateBoardTitle: (id: number, newTitle: string) => Promise<void>;
}) => {
    const dispatch = useDispatch();
    const auth = useSelector((state: IRootState) => state.auth);

    const editKanbanPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'Edit Kanban status'));

    const [boardCardList, setBoardCardList] = useState<ILeadBoardCard[]>([]);
    const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
    const [tempTitle, setTempTitle] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Scrumboard'));
    }, []);

    useEffect(() => {
        if (data && data.length > 0 && boardCardList.length === 0) {
            setBoardCardList(data);
        }
    }, [data]);

    const handleTitleEdit = (boardId: number, title: string) => {
        if (editKanbanPermission) {
            setEditingBoardId(boardId);
            setTempTitle(title);
        }
    };

    const handleTitleChange = async (boardId: number) => {
        if (!editKanbanPermission) return;
        if (tempTitle.trim() === '') {
            Swal.fire('Error', 'Title cannot be empty', 'error');
            return;
        }

        try {
            await updateBoardTitle(boardId, tempTitle);
            const updated = boardCardList.map((b) => (b.id === boardId ? { ...b, title: tempTitle } : b));
            setBoardCardList(updated);
            setEditingBoardId(null);
        } catch {
            Swal.fire('Error', 'Failed to update title', 'error');
        }
    };

    const onDragEndHandler = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const sourceColumnId = Number(source.droppableId);
        const targetColumnId = Number(destination.droppableId);
        const leadId = Number(draggableId);

        if (!sourceColumnId || !targetColumnId) return;

        const previousState = [...boardCardList];

        const newBoards = boardCardList.map((col) => {
            if (col.id === sourceColumnId) {
                const filtered = col.leads.filter((l) => l.id !== leadId);
                return { ...col, leads: filtered };
            }
            return col;
        });

        const movedLead = boardCardList.find((c) => c.id === sourceColumnId)?.leads.find((l) => l.id === leadId);

        const updatedBoards = newBoards.map((col) => {
            if (col.id === targetColumnId && movedLead) {
                const newLeads = Array.from(col.leads);
                newLeads.splice(destination.index, 0, movedLead);
                return { ...col, leads: newLeads };
            }
            return col;
        });

        setBoardCardList(updatedBoards);

        try {
            await handleDragEnd(leadId, targetColumnId);
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to move item',
                text: error?.message || 'Something went wrong',
                confirmButtonText: 'OK',
            });
            setBoardCardList(previousState);
        }
    };

    return (
        <div className="relative pt-5">
            <div className="perfect-scrollbar h-full -mx-2">
                <div className="overflow-x-auto flex flex-nowrap gap-5 pb-2 px-2">
                    <DragDropContext onDragEnd={onDragEndHandler}>
                        {boardCardList.map((board) => (
                            <Droppable droppableId={String(board.id)} key={board.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`panel w-[335px] flex-none bg-[#f4f4f4]/50 shadow-none rounded-2xl p-3 min-h-[150px] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex justify-between mb-5">
                                            {editingBoardId === board.id ? (
                                                <input
                                                    type="text"
                                                    value={tempTitle}
                                                    onChange={(e) => setTempTitle(e.target.value)}
                                                    onBlur={() => handleTitleChange(board.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleTitleChange(board.id);
                                                    }}
                                                    className="text-base font-semibold border rounded px-2 py-1 w-full"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h4
                                                    className={`text-base font-semibold ${editKanbanPermission ? 'cursor-pointer' : 'cursor-default'}`}
                                                    onClick={() => editKanbanPermission && handleTitleEdit(board.id, board.title)}
                                                >
                                                    {board.title}
                                                </h4>
                                            )}
                                        </div>

                                        {board.leads.length === 0 && <div className="min-h-[50px] flex items-center justify-center text-gray-400">No leads</div>}

                                        {board.leads.map((lead, index) => (
                                            <Draggable draggableId={String(lead.id)} index={index} key={lead.id}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`mb-3 ${snapshot.isDragging ? 'shadow-lg bg-white' : ''}`}
                                                    >
                                                        <BoardCard lead={lead} index={index} openEditLeadModal={() => openEditModal(lead.id)} openDeleteLeadModal={() => openDeleteModal(lead.id)} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </DragDropContext>
                </div>
            </div>
        </div>
    );
};

export default ScrumBoard;
