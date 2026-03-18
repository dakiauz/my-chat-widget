import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import Alert from '../../../features/Authentication/components/Alert';

function BroascastAlert() {
    const usersSlice = useSelector((state: IRootState) => state.users) as IRootState['users'];

    return <>{usersSlice.alert && <Alert className="mt-4" variant={usersSlice?.alert?.variant} message={usersSlice.alert?.message} title={usersSlice.alert.title} />}</>;
}

export default BroascastAlert;
