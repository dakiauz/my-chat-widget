import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addAlert } from '../../../../../slices/usersSlice';
import LeadsListForm from './LeadsListForm';
import { useAddLeadListMutation } from '../../services/leadsListApi';
import { IAddLeadListRequest, ILeadList } from '../../models/leadsList';
import { showNotification } from '@mantine/notifications';

function AddBody({ close }: { close?: () => void }) {
    const dispatch = useDispatch();
    const [addLead, { isLoading }] = useAddLeadListMutation();
    const navigate = useNavigate();

    const data: ILeadList = {
        id: -1,
        company_id: -1,
        name: '',
        description: '',
    };

    function submit(formData: IAddLeadListRequest): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!formData) return resolve();
            addLead(formData)
                .unwrap()
                .then((payload: any) => {
                    showNotification({
                        title: 'Success',
                        message: payload.message || 'Lead added successfully.',
                        color: 'green',
                    });

                    if (close) close();
                })
                .catch((error: any) => {
                    console.error('Add Lead Error:', error);

                    showNotification({
                        title: 'Error',
                        message: error?.data?.message || error?.message || 'Failed to add lead.',
                        color: 'red',
                    });
                })
                .finally(() => {
                    // navigate('/leadslist');
                    resolve();
                });
        });
    }

    return (
        <div>
            <LeadsListForm
                data={data}
                add={submit}
                fetching={isLoading}
                close={() => {
                    if (close) close();
                }}
            />
        </div>
    );
}

export default AddBody;
