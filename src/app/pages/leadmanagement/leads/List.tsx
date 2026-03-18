import { Alert } from '@mantine/core';
import { FC, lazy, Suspense, useEffect, useState, useMemo } from 'react';
import IconX from '../../../../_theme/components/Icon/IconX';
import { useGetLeadsQuery } from '../../../features/LeadManagement/Leads/services/leadsApi';
import Fallback from '../../../shared/components/ui/Fallback';
import Show from '../../../shared/helpers/Show';
import { IRootState } from '../../../store';
import { useParams } from 'react-router-dom';
import LeadsKanban from '../../../features/LeadManagement/Leads/LeadsKanban';

const LeadsPage = lazy(() => import('../../../features/LeadManagement/Leads/LeadsPage'));

function List(): ReturnType<FC> {
    const { leadListId } = useParams();

    const [selectedLeadList, setSelectedLeadList] = useState<string | undefined>(leadListId);
    const [selectedSources, setSelectedSources] = useState<string[]>([]);

    const { data: leadsData, isFetching: isLeadsFetching, isLoading: isLeadsLoading, isError: isLeadsError, error: leadsError } = useGetLeadsQuery(selectedLeadList);

    // Filter leads by sources (multiple)
    const filteredLeads = useMemo(() => {
        if (!leadsData?.data.leads) return [];
        if (!selectedSources.length) return leadsData.data.leads;
        return leadsData.data.leads.filter((lead) => selectedSources.includes(lead.source));
    }, [leadsData?.data.leads, selectedSources]);

    const [isKanban, setIsKanban] = useState(false);
    return (
        <Suspense fallback={<Fallback title="Leads" />}>
            {isLeadsLoading ? (
                <Fallback title="Leads" />
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
                    {isKanban ? (
                        <LeadsKanban
                            data={filteredLeads}
                            fetching={isLeadsFetching}
                            setIsKanban={setIsKanban}
                            setSelectedLeadList={setSelectedLeadList}
                            selectedLeadList={selectedLeadList ?? ''}
                            selectedSources={selectedSources}
                            setSelectedSources={setSelectedSources}
                        />
                    ) : (
                        <LeadsPage
                            fetching={isLeadsFetching}
                            data={filteredLeads}
                            selectedLeadList={selectedLeadList ?? ''}
                            setSelectedLeadList={setSelectedLeadList}
                            setIsKanban={setIsKanban}
                            selectedSources={selectedSources}
                            setSelectedSources={setSelectedSources}
                        />
                    )}
                </>
            )}
        </Suspense>
    );
}

export default List;
