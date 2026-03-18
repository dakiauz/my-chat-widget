import { Alert, Box, LoadingOverlay } from '@mantine/core';
import { FC, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import IconX from '../../../../_theme/components/Icon/IconX';
import ToastALert from '../../../features/Authentication/components/Alert';
import { useGetPermissionsQuery, useGetRolesQuery } from '../../../features/User Management/Roles/services/rolesApi';
import Fallback from '../../../shared/components/ui/Fallback';
import Show from '../../../shared/helpers/Show';
import { IRootState } from '../../../store';

const RolesPage = lazy(() => import('../../../features/User Management/Roles/components/RolesPage'));

function List(): ReturnType<FC> {
    const { data: permissionsData, isFetching: isPermissionsFetching, isLoading: isPermissionsLoading, isError: isPermissionsError, error: permissionsError } = useGetPermissionsQuery();

    const { data: rolesData, isFetching: isRolesFetching, isLoading: isRolesLoading, isError: isRoleError, error: rolesError } = useGetRolesQuery({ count: 5 }, { refetchOnMountOrArgChange: true });

    const usersSlice = useSelector((state: IRootState) => state.users) as IRootState['users'];

    return (
        <Suspense fallback={<Fallback title="Roles" />}>
            {isRolesLoading || isPermissionsLoading ? (
                <Fallback title="Roles" />
            ) : (
                <>
                    <Show
                        when={!rolesData?.success && !permissionsData?.success}
                        show={
                            <Alert icon={<IconX />} variant="filled" title="Error" color="red">
                                {isRoleError || isPermissionsError
                                    ? 'Something went wrong, Please try again later'
                                    : !rolesData?.success
                                    ? rolesData?.message
                                    : !permissionsData?.success
                                    ? permissionsData?.message
                                    : 'No data found'}
                            </Alert>
                        }
                    />

                    {usersSlice.alert && <ToastALert className="mt-4" variant={usersSlice?.alert?.variant} message={usersSlice.alert?.message} title={usersSlice.alert.title} />}

                    <Box pos="relative">
                        <LoadingOverlay visible={isRolesFetching && !rolesData} zIndex={1000} overlayBlur={1} />
                        <RolesPage data={rolesData?.data?.roles ?? []} />
                    </Box>
                </>
            )}
        </Suspense>
    );
}

export default List;
