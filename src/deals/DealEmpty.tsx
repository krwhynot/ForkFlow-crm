import { Stack, Typography } from '../components/ui-kit';
import { LinearProgress } from '@mui/material';
import { CreateButton, useGetList } from 'react-admin';
import useAppBarHeight from '../misc/useAppBarHeight';
import { matchPath, useLocation } from 'react-router';
import { DealCreate } from './DealCreate';
import { Contact } from '../types';
import { Link } from 'react-router-dom';

export const DealEmpty = ({ children }: { children?: React.ReactNode }) => {
    const location = useLocation();
    const matchCreate = matchPath('/deals/create', location.pathname);
    const appbarHeight = useAppBarHeight();

    // get Contact data
    const { data: contacts, isPending: contactsLoading } = useGetList<Contact>(
        'contacts',
        {
            pagination: { page: 1, perPage: 1 },
        }
    );

    if (contactsLoading) return <LinearProgress />;

    return (
        <Stack
            className="justify-center items-center gap-3"
            sx={{
                height: `calc(100dvh - ${appbarHeight}px)`,
            }}
        >
            <img src="./img/empty.svg" alt="No deals found" />
            {contacts && contacts.length > 0 ? (
                <>
                    <Stack className="gap-0 items-center">
                        <Typography variant="h6" fontWeight="bold">
                            No deals found
                        </Typography>
                        <Typography
                            variant="body2"
                            align="center"
                            className="text-gray-500"
                            gutterBottom
                        >
                            It seems your deal list is empty.
                        </Typography>
                    </Stack>
                    <Stack className="gap-2 flex-row">
                        <CreateButton variant="contained" label="Create deal" />
                    </Stack>
                    <DealCreate open={!!matchCreate} />
                    {children}
                </>
            ) : (
                <Stack className="gap-0 items-center">
                    <Typography variant="h6" fontWeight="bold">
                        No deals found
                    </Typography>
                    <Typography
                        variant="body2"
                        align="center"
                        className="text-gray-500"
                        gutterBottom
                    >
                        It seems your contact list is empty.
                        <br />
                        <Link to="/contacts/create">
                            Add your first contact
                        </Link>{' '}
                        before creating a deal.
                    </Typography>
                </Stack>
            )}
        </Stack>
    );
};
