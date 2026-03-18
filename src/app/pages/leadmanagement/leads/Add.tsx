import { Suspense } from 'react';
import BroascastAlert from '../../../shared/components/ui/BroascastAlert';
import Fallback from '../../../shared/components/ui/Fallback';
import withTitle from '../../../shared/helpers/withTitle';
import AddBody from '../../../features/LeadManagement/Leads/components/forms/AddBody';

function Add() {
    const title = 'Leads';

    return (
        <Suspense fallback={<Fallback title={title} />}>
            <BroascastAlert />
            {/* Render the AddBody form for the Leads page */}
            <AddBody />
        </Suspense>
    );
}

export default withTitle('Dakia.ai', Add);
