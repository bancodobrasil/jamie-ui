import React from 'react';
import { Box, Button, Link, styled, SxProps, Theme, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ErrorPageImage from '../../../public/images/error-page.png';

const Image = styled('img')({
  height: 275,
});

interface ButtonProps {
  label: string;
  onClick: () => void;
}

interface NavigationLinkProps {
  label: string;
  to: string;
}

interface DefaultErrorPageProps {
  title: string;
  description: string;
  button: ButtonProps;
  navigationLink?: NavigationLinkProps;
  sx?: SxProps<Theme>;
  imageProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

const DefaultErrorPage = ({
  title,
  description,
  button,
  navigationLink = undefined,
  sx = [],
  imageProps = {},
}: DefaultErrorPageProps): JSX.Element => (
  <Box
    sx={[
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        pb: '77px',
        width: '50%',
        mx: 'auto',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Image src={ErrorPageImage as string} alt="Error" {...imageProps} />
    <Typography variant="h1" sx={{ mt: '19px', textAlign: 'center', fontSize: '32px' }}>
      {title}
    </Typography>
    <Typography
      variant="body1"
      sx={{ mt: '8px', textAlign: 'center', fontSize: '18px', lineHeight: '22.5px', width: '50%' }}
    >
      {description}
    </Typography>
    <Button variant="contained" color="primary" onClick={button.onClick} sx={{ mt: '34px' }}>
      {button.label}
    </Button>
    {navigationLink && (
      <Link
        color="link.main"
        component={RouterLink}
        to={navigationLink.to}
        sx={{
          textAlign: 'center',
          mt: '20px',
          fontSize: '14px',
          lineHeight: '15.75px',
          letterSpacing: '0.014em',
          width: '50%',
        }}
      >
        {navigationLink.label}
      </Link>
    )}
  </Box>
);

export default DefaultErrorPage;
