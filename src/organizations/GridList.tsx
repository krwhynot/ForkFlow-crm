import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { useListContext, RecordContextProvider } from 'react-admin';
import { OrganizationCard } from './OrganizationCard';
import { Organization } from '../types';

export const ImageList = () => {
    const { data, isLoading } = useListContext<Organization>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    if (isLoading) return null;

    // Determine grid spacing and columns based on screen size
    const getColumns = () => {
        if (isMobile) return 1;
        if (isTablet) return 2;
        return 3;
    };

    return (
        <Grid container spacing={2} sx={{ mt: 1, mb: 2, px: 1 }}>
            {data?.map(record => (
                <Grid
                    item
                    key={record.id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    xl={3}
                    sx={{
                        display: 'flex',
                    }}
                >
                    <RecordContextProvider value={record}>
                        <OrganizationCard />
                    </RecordContextProvider>
                </Grid>
            ))}
        </Grid>
    );
};
