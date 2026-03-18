import { Alert } from '@mantine/core';
import { FC, lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import IconX from '../../../../_theme/components/Icon/IconX';
import Fallback from '../../../shared/components/ui/Fallback';
import Show from '../../../shared/helpers/Show';
import { IRootState } from '../../../store';
import { useGetLeadsListQuery } from '../../../features/LeadManagement/LeadList/services/leadsListApi';

const LeadsListPage = lazy(() => import('../../../features/LeadManagement/LeadList/LeadsListPage'));

function List(): ReturnType<FC> {
    const auth = useSelector((state: IRootState) => state.auth as IRootState['auth']);
    const { data: leadsListData, isFetching: isLeadsFetching, isLoading: isLeadsLoading, isError: isLeadsError, error: leadsError } = useGetLeadsListQuery();

    return (
        <Suspense fallback={<Fallback title="Leads List" />}>
            {isLeadsLoading ? (
                <Fallback title="Leads List" />
            ) : (
                <>
                    <Show
                        when={isLeadsError}
                        show={
                            <Alert icon={<IconX />} variant="filled" title="Error" color="red">
                                {(leadsError as any)?.message || 'Something went wrong, Please try again later'}
                            </Alert>
                        }
                    />
                    <LeadsListPage fetching={isLeadsFetching} data={leadsListData?.data?.leadLists ?? []} />
                </>
            )}
        </Suspense>
    );
}

export default List;
