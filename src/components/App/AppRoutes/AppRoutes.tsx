import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import { ListMenu } from '../../../pages/Menu/List';
import { ItemsPreview } from '../../../pages/Menu/Items';
import { CreateMenu } from '../../../pages/Menu/Create';
import { ShowMenu } from '../../../pages/Menu/Show';
import { EditMenu } from '../../../pages/Menu/Edit';
import Loading from '../../Loading';
import { ProtectedRoute } from '.';
import NotFound from '../../../pages/NotFound';
import Layout from '../../Layout';

export const AppRoutes = () => {
  const { initialized } = useKeycloak();

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
              <Route path="items" element={<ItemsPreview />} />
              <Route path="edit" element={<EditMenu />} />
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
