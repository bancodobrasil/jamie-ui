import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useKeycloak } from '@react-keycloak/web';

interface Props {
  children?: JSX.Element;
}

export const ProtectedRoute = ({ children }: Props): JSX.Element => {
  const { keycloak } = useKeycloak();

  const location = useLocation();

  if (!keycloak?.authenticated)
    keycloak?.login({ redirectUri: `http://localhost:3000/${location.pathname}` });

  if (children) return children;

  return <Outlet />;
};
