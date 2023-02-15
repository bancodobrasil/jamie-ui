import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import { ListMenu } from '../../../pages/Menu/List';
import { EditTemplateItems, ItemsPreview } from '../../../pages/Menu/Items';
import { CreateMenu } from '../../../pages/Menu/Create';
import { ShowMenu } from '../../../pages/Menu/Show';
import { EditMenu } from '../../../pages/Menu/Edit';
import { EditTemplateMenu } from '../../../pages/Menu/EditTemplate';
import Loading from '../../Loading';
import { ProtectedRoute } from '.';
import NotFound from '../../../pages/NotFound';
import Layout from '../../Layout';

export const AppRoutes = () => {
  const { initialized, keycloak } = useKeycloak();

  React.useEffect(() => {
    if (!initialized || !keycloak) return;
    if (!keycloak.authenticated) {
      keycloak.onTokenExpired = undefined;
    }
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(5);
    };
    // Force refresh token
    keycloak.updateToken(-1);
    return () => {
      if (keycloak) keycloak.onTokenExpired = undefined;
    };
  }, [initialized, keycloak, keycloak?.authenticated]);

  const renderRoutes = () => {
    if (!initialized) {
      return <Loading />;
    }
    return (
      <NotificationProvider>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route index element={<Navigate to="/menus" replace />} />
          <Route path="menus" element={<ProtectedRoute />}>
            <Route index element={<ListMenu />} />
            <Route path=":id">
              <Route index element={<ShowMenu />} />
              <Route path="edit" element={<EditMenu />} />
              <Route path="editTemplate" element={<EditTemplateMenu />} />
              <Route path="items">
                <Route index element={<ItemsPreview />} />
                <Route path=":itemId" element={<EditTemplateItems />} />
              </Route>
            </Route>
            <Route path="create" element={<CreateMenu />} />
          </Route>
        </Routes>
      </NotificationProvider>
    );
  };

  return (
    <Router>
      <Layout>{renderRoutes()}</Layout>
    </Router>
  );
};
