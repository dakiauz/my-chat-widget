import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addAlert } from '../../../../../slices/usersSlice';
import LeadsListForm from './LeadsListForm';
import { useAddLeadListMutation, useUpdateLeadListMutation } from '../../services/leadsListApi';
import { IAddLeadListRequest, ILeadList } from '../../models/leadsList';

function EditBody({ data, close }: { data: ILeadList; close?: () => void }) {
    const dispatch = useDispatch();
    const [editLeadList, { isLoading }] = useUpdateLeadListMutation();
    const navigate = useNavigate();

    function submit(formData: IAddLeadListRequest, leadListId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!formData || !leadListId) return resolve();
            editLeadList({ formData, id: leadListId })
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

                    dispatch(
                        addAlert({
                            variant: 'danger',
                            message: error?.message ?? 'Failed to add lead.',
                            title: 'Error!',
                        })
                    );
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
                edit={submit}
                fetching={isLoading}
                close={() => {
                    if (close) close();
                }}
            />
        </div>
    );
}

export default EditBody;
