import React from 'react';
import { useSelector } from 'react-redux';
import UnAuthorized from '../../shared/components/ui/pages/UnAuthorized';
import { IRootState } from '../../store';

interface IProtectedRoute {
    permission: string | null | undefined;
    children: React.ReactNode;
}

function ProtectedRoute({ permission, children }: IProtectedRoute) {
    const auth = useSelector((state: IRootState) => state.auth);
    const access = useSelector((state: IRootState) =>
        state.auth.user?.roles?.some((role) => {
            return role.permissions?.some((p) => {
                return p.name == permission;
            });
        })
    );

    return <>{!access && auth && permission ? <UnAuthorized /> : children}</>;
}

export default ProtectedRoute;
