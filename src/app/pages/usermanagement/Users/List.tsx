import { Alert } from '@mantine/core';
import { FC, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import IconX from '../../../../_theme/components/Icon/IconX';
import ToastAlert from '../../../features/Authentication/components/Alert';
import { useGetUserRolesQuery, useGetUsersQuery } from '../../../features/User Management/Users/services/usersApi';
import Fallback from '../../../shared/components/ui/Fallback';
import Show from '../../../shared/helpers/Show';
import { IRootState } from '../../../store';

const UsersPage = lazy(() => import('../../../features/User Management/Users/UsersPage'));

function List(): ReturnType<FC> {
    // Fetch users from API
    const { data: usersData, isFetching: isUsersFetching, isLoading: isUsersLoading, isError: isUsersError, error: usersError } = useGetUsersQuery();

    // Fetch user roles
    const { data: rolesData, isFetching: isRolesFetching, isLoading: isRolesLoading, isError: isRoleError, error: rolesError } = useGetUserRolesQuery(undefined, { refetchOnMountOrArgChange: true });

    const usersSlice = useSelector((state: IRootState) => state.users) as IRootState['users'];
    const title = 'Users';
    const auth = useSelector((state: IRootState) => state.auth);
    const rolesPermission = auth?.user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'View Roles'));

    return (
        <Suspense fallback={<Fallback title={title} />}>
            {isUsersLoading ? (
                <Fallback title={title} />
            ) : (
                <>
                    {/* Show error message if API fails */}
                    <Show
                        when={isUsersError || isRoleError}
                        show={
                            <Alert icon={<IconX />} variant="filled" title="Error" color="red">
                                {(usersError as any)?.message || rolesPermission ? (rolesError as any)?.message || 'Something went wrong, Please try again later' : 'No Roles Permission Found'}
                            </Alert>
                        }
                    />

                    {/* Show alert message if there's any from usersSlice */}
                    {usersSlice.alert && <ToastAlert className="mt-4" variant={usersSlice.alert.variant} message={usersSlice.alert.message} title={usersSlice.alert.title} />}

                    {/* Pass fetched users data to UsersPage */}
                    <UsersPage fetching={isUsersFetching || (isRolesFetching && !rolesData)} data={usersData?.data.users ?? []} />
                </>
            )}
        </Suspense>
    );
}

export default List;
