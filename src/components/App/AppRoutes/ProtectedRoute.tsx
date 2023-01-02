import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useKeycloak } from '@react-keycloak/web';

interface Props {
  children?: JSX.Element;
}

export const ProtectedRoute = ({ children }: Props): JSX.Element => {
  const { keycloak } = useKeycloak();

  if (!keycloak?.authenticated) return <Navigate to="/login" />;

  if (children) return children;

  return <Outlet />;
};
