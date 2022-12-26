import React from 'react';
import { Box, Typography, SxProps, TypographyVariant } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumbs, AppBreadcrumbsProps } from '../AppBreadcrumbs';

export const ErrorFallback = ({
  message,
  variant = 'h4',
  sx = {},
}: {
  message?: string;
  variant?: TypographyVariant;
  sx?: SxProps;
}): JSX.Element => {
  const { t } = useTranslation();

  message = message || t('common.error.default');

  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Typography
        component="p"
        variant={variant}
        sx={{
          color: 'error.main',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export const ErrorFallbackWithBreadcrumbs = ({
  message,
  variant,
  sx = {},
  appBreadcrumbsProps,
}: {
  message?: string;
  variant?: TypographyVariant;
  sx?: SxProps;
  appBreadcrumbsProps: AppBreadcrumbsProps;
}): JSX.Element => {
  const { t } = useTranslation();

  message = message || t('common.error.default');

  return (
    <Box
      sx={{
        width: '100%',
        paddingTop: '34px',
        paddingBottom: '34px',
      }}
    >
      <AppBreadcrumbs {...appBreadcrumbsProps} />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '11px',
        }}
      >
        <ErrorFallback message={message} variant={variant} sx={sx} />
      </Box>
    </Box>
  );
};
