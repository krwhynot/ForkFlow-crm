import { Stack, Typography } from '../components/ui-kit';
import { CreateButton } from 'react-admin';
import useAppBarHeight from '../misc/useAppBarHeight';
import { ContactImportButton } from './ContactImportButton';

export const ContactEmpty = () => {
    const appbarHeight = useAppBarHeight();
    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            spacing={3}
            style={{
                height: `calc(100dvh - ${appbarHeight}px)`,
            }}
        >
            <img src="./img/empty.svg" alt="No contacts found" />
            <Stack spacing={0} alignItems="center">
                <Typography variant="h6" className="font-bold">
                    No contacts found
                </Typography>
                <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                    className="mb-4"
                >
                    It seems your contact list is empty.
                </Typography>
            </Stack>
            <Stack spacing={2} direction="row">
                <CreateButton variant="contained" label="New Contact" />
                <ContactImportButton />
            </Stack>
        </Stack>
    );
};
