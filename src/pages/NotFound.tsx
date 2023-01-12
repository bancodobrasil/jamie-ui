import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DefaultErrorPage from '../components/DefaultErrorPage';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DefaultErrorPage
      title={t('notFound.title')}
      description={t('notFound.description')}
      button={{
        label: t('notFound.button'),
        onClick: () => navigate('/'),
      }}
    />
  );
};

export default NotFound;
