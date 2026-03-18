import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addAlert } from '../../../../slices/usersSlice';
import { IRootState } from '../../../../store';
import { useGetLeadsQuery } from '../../../LeadManagement/Leads/services/leadsApi';
import { ITask, ITaskFormData, SubmitTaskFormDataType } from '../../models/task';
import { useUpdateTaskMutation } from '../../services/tasksApi';
import TaskForm from '../TasksForm';

interface IEditTaskProps {
    close: () => void;
    data: ITask;
    taskId: number;
    leads: any[]; // received from parent component (task.leads)
}

function EditTaskBody({ close, data, taskId, leads }: IEditTaskProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state: IRootState) => state.auth);

    const { data: leadsData, isLoading: isLeadsLoading, isError: isLeadsError } = useGetLeadsQuery();
    const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

    // Use the leads passed in from the parent (selectedTask.leads)
    const availableLeads = Array.isArray(leadsData?.data?.leads)
        ? leadsData?.data.leads.map((lead) => ({
              value: lead.id.toString(),
              label: `${lead.firstName} ${lead.lastName ?? ''}`,
              id: lead.id,
          }))
        : [];

    // Pre-fill selected leads for the form
    const selectedLeads =
        data.leads?.map((lead: any) => ({
            value: lead.id.toString(),
            label: lead.label || `${lead.firstName} ${lead.lastName ?? ''} `,
            id: lead.id,
        })) || [];

    function submit(formData: SubmitTaskFormDataType, taskId: number) {
        return new Promise<void>((resolve, reject) => {
            if (!formData || !taskId) return resolve();

            const transformedLeads = Array.isArray(formData.leads)
                ? formData.leads
                      .map((lead: any) => {
                          // If lead has a pivot object, extract the lead_id
                          if (lead.pivot && lead.pivot.lead_id) {
                              return lead.pivot.lead_id; // Return the lead_id from the pivot object
                          }
                          // Otherwise, if it's already an ID, just return it
                          if (typeof lead === 'number' || typeof lead === 'string') {
                              return Number(lead); // Ensure it's always a number
                          }
                          return null; // If neither, return null (shouldn't happen if the data is correct)
                      })
                      .filter((v: number | null) => v !== null) // Remove any null values
                : [];

            const transformedData = {
                ...formData,
                leads: transformedLeads, // Only pass the lead IDs
            };

            // Submit the updated task data
            updateTask({ taskId, formData: transformedData })
                .unwrap()
                .then((payload: any) => {
                    dispatch(
                        addAlert({
                            variant: payload.success ? 'success' : 'warning',
                            message: payload.message,
                            title: payload.success ? 'Success!' : 'Warning!',
                        })
                    );
                })
                .catch((error: any) => {
                    console.error('Update Task Error:', error);
                    dispatch(
                        addAlert({
                            variant: 'danger',
                            message: error?.error?.message ?? error?.message ?? 'Failed to edit task.',
                            title: 'Error!',
                        })
                    );
                })
                .finally(() => {
                    close();
                    resolve();
                });
        });
    }

    if (isLeadsLoading) return <div>Loading leads...</div>;
    if (isLeadsError) return <div>Error fetching leads. Please try again later.</div>;

    return (
        <TaskForm
            data={data}
            close={close}
            edit={submit}
            fetching={isUpdating}
            leads={availableLeads ?? []} // Pass the available leads fetched from API
            selectedLeads={selectedLeads} // Pass the selected leads from the task
        />
    );
}

export default EditTaskBody;
