import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { ApolloProvider } from '@apollo/client';
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
import RestoreRevision from '../../../pages/Menu/Revisions/Restore';
import CreateRevision from '../../../pages/Menu/Revisions/Create';
import PublishRevision from '../../../pages/Menu/Revisions/Publish';
import ApiClient from '../../../api';
import ListPendencies from '../../../pages/Menu/Pendencies/List';

export const AppRoutes = () => {
  const { initialized, keycloak } = useKeycloak();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    if (!initialized || !keycloak) return;
    if (!keycloak.authenticated) {
      keycloak.onTokenExpired = undefined;
    }
    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(5)
        .then(refreshed => {
          if (refreshed) {
            ApiClient.setup(keycloak.token);
          }
        })
        .catch(() => {
          ApiClient.setup(keycloak.token);
        });
    };
    // Force refresh token
    keycloak
      .updateToken(-1)
      .then(refreshed => {
        ApiClient.setup(keycloak.token);
        setHasMounted(true);
      })
      .catch(() => {
        ApiClient.setup(keycloak.token);
        setHasMounted(true);
      });
    return () => {
      if (keycloak) keycloak.onTokenExpired = undefined;
    };
  }, [initialized, keycloak, keycloak?.authenticated]);

  const renderRoutes = () => {
    if (!initialized || !hasMounted) {
      return <Loading />;
    }
    return (
      <ApolloProvider client={ApiClient.client}>
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
                <Route path="restoreVersion" element={<RestoreRevision />} />
                <Route path="closeVersion" element={<CreateRevision />} />
                <Route path="publishVersion" element={<PublishRevision />} />
                <Route path="pendencies" element={<ListPendencies />} />
              </Route>
              <Route path="create" element={<CreateMenu />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </ApolloProvider>
    );
  };

  return (
    <Router>
      <Layout>{renderRoutes()}</Layout>
    </Router>
  );
};
