import { Grid } from '../components/ui-kit';
import { useListContext, RecordContextProvider } from 'react-admin';
import { ContactCard } from './ContactCard';
import { Contact } from '../types';

export const ContactListContent = () => {
    const { data, isLoading } = useListContext<Contact>();
    const isMobile = window.innerWidth < 640; // Tailwind 'sm' breakpoint
    const isTablet = window.innerWidth < 768; // Tailwind 'md' breakpoint

    if (isLoading) return null;

    return (
        <Grid container spacing={2} className="mt-2 mb-4 px-2">
            {data?.map(record => (
                <Grid
                    item
                    key={record.id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    xl={3}
                    className="flex"
                >
                    <RecordContextProvider value={record}>
                        <ContactCard />
                    </RecordContextProvider>
                </Grid>
            ))}
        </Grid>
    );
};
