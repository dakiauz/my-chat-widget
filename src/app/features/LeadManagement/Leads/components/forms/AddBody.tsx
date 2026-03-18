import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addAlert } from '../../../../../slices/usersSlice';
import { IAddLeadPayload, ILead, SubmitLeadFormDataType } from '../../models/lead';
import { useAddLeadMutation } from '../../services/leadsApi';
import LeadsForm from '../LeadsForm';
import { initialLeadData } from '../../LeadsPage';
import { showNotification } from '@mantine/notifications';

function AddBody({ close, leadListId, initialPhone }: { close?: () => void; leadListId?: number | null; initialPhone?: string }) {
    const { leadListId: leadListIdFromParam } = useParams();
    console.log('leadListIdFromParam', leadListIdFromParam);
    const dispatch = useDispatch();
    const [addLead, { isLoading }] = useAddLeadMutation();
    const navigate = useNavigate();

    const data: ILead = {
        ...initialLeadData,
        lead_list_id: leadListId ?? Number(leadListIdFromParam),
        phone: initialPhone ?? '',
    };

    function submit(formData: IAddLeadPayload): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!formData) return resolve();

            addLead(formData)
                .unwrap()
                .then((payload: any) => {
                    dispatch(
                        addAlert({
                            variant: payload.success ? 'success' : 'warning',
                            message: payload.message,
                            title: payload.success ? 'Success!' : 'Warning!',
                        })
                    );

                    if (close) close();
                })
                .catch((error: any) => {
                    console.error('Add Lead Error:', error);

                    showNotification({
                        title: 'Error!',
                        message: error?.data?.message ?? error?.message ?? 'Failed to add lead.',
                        color: 'red',
                    });

                    dispatch(
                        addAlert({
                            variant: 'danger',
                            message: error?.message ?? 'Failed to add lead.',
                            title: 'Error!',
                        })
                    );
                })
                .finally(() => {
                    resolve();
                });
        });
    }

    return (
        <div>
            <LeadsForm
                data={data}
                add={submit}
                fetching={isLoading}
                close={() => {
                    if (close) close();
                    // else navigate(-1);
                }}
            />
        </div>
    );
}

export default AddBody;
