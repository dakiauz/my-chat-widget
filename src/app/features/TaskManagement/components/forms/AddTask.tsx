import { useDispatch } from 'react-redux';
import { addAlert } from '../../../../slices/usersSlice';
import { useGetLeadsQuery } from '../../../LeadManagement/Leads/services/leadsApi';
import { ITask, ITaskFormData, SubmitTaskFormDataType } from '../../models/task';
import { useCreateTaskMutation } from '../../services/tasksApi';
import TasksForm from '../TasksForm';
import { useParams } from 'react-router-dom';

interface IAddTaskBodyProps {
    close: () => void;
}

function AddTaskBody({ close }: IAddTaskBodyProps) {
    const dispatch = useDispatch();
    const { leadListId } = useParams();
    const { data: leadsData, isLoading: isLeadsLoading } = useGetLeadsQuery();
    const [addTask, { isLoading }] = useCreateTaskMutation();

    // Initial form state
    const data: ITask = {
        id: -1,
        user_id: -1,
        leads: [],
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
    };

    async function submit(formData: SubmitTaskFormDataType) {
        // Check if leads are selected
        if (!formData.leads || formData.leads.length === 0) {
            dispatch(
                addAlert({
                    variant: 'warning',
                    message: 'Please select at least one lead.',
                    title: 'No Leads Selected',
                })
            );
            return;
        }

        // Extract integers only from selected leads
        const formattedLeads = formData.leads.map((lead: any) => {
            if (typeof lead === 'object' && 'value' in lead) {
                return Number(lead.value);
            }
            return Number(lead); // In case it's a string or number
        });

        const formattedData = {
            ...formData,
            leads: formattedLeads,
        };

        try {
            const payload = await addTask(formattedData).unwrap();

            dispatch(
                addAlert({
                    variant: payload.success ? 'success' : 'warning',
                    message: payload.message,
                    title: payload.success ? 'Success!' : 'Warning!',
                })
            );
        } catch (error) {
            console.error('Add Task Error:', error);
            dispatch(
                addAlert({
                    variant: 'danger',
                    message: 'Failed to add task.',
                    title: 'Error!',
                })
            );
        } finally {
            close();
        }
    }

    // Convert leads to options for dropdown
    const leadsOptions =
        leadsData?.data?.leads?.map((lead: any) => ({
            value: lead.id,
            label: `${lead.firstName} ${lead.lastName ?? ''}`,
        })) || [];

    return <TasksForm data={data} close={close} add={submit} fetching={isLoading || isLeadsLoading} leads={leadsOptions} selectedLeads={[]} />;
}

export default AddTaskBody;
