import React from 'react';
import {
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMediaQuery } from '@mui/material';

interface LoadingComponentProps {
  variant?: 'spinner' | 'skeleton' | 'minimal';
  message?: string;
  height?: number | string;
  fullScreen?: boolean;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  variant = 'spinner',
  message = 'Loading...',
  height = '200px',
  fullScreen = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: fullScreen ? '100vh' : height,
    width: '100%',
    padding: theme.spacing(2),
  };

  if (variant === 'minimal') {
    return (
      <Box sx={containerStyles}>
        <CircularProgress size={24} thickness={4} />
      </Box>
    );
  }

  if (variant === 'skeleton') {
    return (
      <Box sx={{ padding: theme.spacing(2), width: '100%' }}>
        <Stack spacing={1}>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
          <Skeleton variant="rectangular" width="100%" height={60} />
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="80%" />
          {!isMobile && (
            <>
              <Skeleton variant="rectangular" width="100%" height={120} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="circular" width={40} height={40} />
                <Stack sx={{ flex: 1 }}>
                  <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width="60%" />
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={containerStyles}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress
          size={isMobile ? 32 : 48}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
          }}
        />
        <Typography
          variant={isMobile ? 'body2' : 'body1'}
          color="text.secondary"
          textAlign="center"
        >
          {message}
        </Typography>
      </Stack>
    </Box>
  );
};

export const LoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading module...' 
}) => (
  <LoadingComponent variant="spinner" message={message} height="300px" />
);

export const SkeletonFallback: React.FC = () => (
  <LoadingComponent variant="skeleton" />
);

export const MinimalLoader: React.FC = () => (
  <LoadingComponent variant="minimal" height="80px" />
);

export const FullScreenLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading application...' 
}) => (
  <LoadingComponent variant="spinner" message={message} fullScreen />
);

export default LoadingComponent;