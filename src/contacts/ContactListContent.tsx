import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { useListContext, RecordContextProvider } from 'react-admin';
import { ContactCard } from './ContactCard';
import { Contact } from '../types';

export const ContactListContent = () => {
    const { data, isLoading } = useListContext<Contact>();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    if (isLoading) return null;

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
                        <ContactCard />
                    </RecordContextProvider>
                </Grid>
            ))}
        </Grid>
    );
};
