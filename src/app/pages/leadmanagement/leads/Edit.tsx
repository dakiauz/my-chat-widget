import { Suspense, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ILead, ILeadFormData } from '../../../features/LeadManagement/Leads/models/lead';
import { useGetLeadsQuery } from '../../../features/LeadManagement/Leads/services/leadsApi';
import Fallback from '../../../shared/components/ui/Fallback';
import withTitle from '../../../shared/helpers/withTitle';
import EditBody from '../../../features/LeadManagement/Leads/components/forms/EditBody';

function Edit() {
    const { id } = useParams(); // Get 'id' from the URL params
    const { leadListId } = useParams();

    const navigate = useNavigate();
    const [data, setData] = useState<ILead | null>(null);

    // Fetch data using the API call and the selected 'id'
    const { data: fetchedData, isLoading, isError } = useGetLeadsQuery(leadListId);

    useEffect(() => {
        if (fetchedData && !isLoading && !isError) {
            // Extract the specific lead based on the 'id' and set it to state
            const selectedLead = fetchedData.data.leads.find((lead) => lead.id.toString() === id);
            if (selectedLead) {
                setData(selectedLead); // Set the selected lead to state
            }
        }
    }, [fetchedData, isLoading, isError, id]);

    const title = 'Leads';

    if (isLoading) return <Fallback title={title} />;
    if (isError || !data) return <Fallback title={title} />;

    return (
        <Suspense fallback={<Fallback title={title} />}>
            <EditBody data={data} />
        </Suspense>
    );
}

export default withTitle('Dakia.ai', Edit);
