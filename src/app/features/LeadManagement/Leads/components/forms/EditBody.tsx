import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addAlert } from '../../../../../slices/usersSlice';
import { IRootState } from '../../../../../store';
import { IAddLeadPayload, ILead, SubmitLeadFormDataType } from '../../models/lead';
import { useUpdateLeadMutation } from '../../services/leadsApi';
import LeadsForm from '../LeadsForm';
import { showNotification } from '@mantine/notifications';

interface IEditBodyProps {
    data: ILead;
    close?: () => void;
}

function EditBody({ data, close }: IEditBodyProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state: IRootState) => state.auth);
    const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();

    const submit = async (formData: IAddLeadPayload, leadId: number) => {
        if (!formData || !leadId) return;

        try {
            const payload = await updateLead({ id: leadId, formData }).unwrap();

            dispatch(
                addAlert({
                    variant: payload.success ? 'success' : 'warning',
                    message: payload.message,
                    title: payload.success ? 'Success!' : 'Warning!',
                })
            );
            if (close) close();
        } catch (error: any) {
            showNotification({
                title: 'Error!',
                message: error?.data?.message ?? error?.message ?? 'Failed to edit lead.',
                color: 'red',
            });

            dispatch(
                addAlert({
                    variant: 'danger',
                    message: error?.error?.message ?? error?.message ?? 'Failed to edit lead.',
                    title: 'Error!',
                })
            );
            console.log('Error Alert Dispatched!'); // Debugging
        }
    };

    return (
        <div>
            <LeadsForm
                data={data}
                edit={submit}
                fetching={isUpdating}
                close={() => {
                    if (close) close();
                    // else navigate(-1);
                }}
            />
        </div>
    );
}

export default EditBody;
