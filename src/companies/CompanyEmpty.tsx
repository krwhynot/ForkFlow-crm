import { Box } from '../components/ui-kit';
import { CreateButton } from 'react-admin';
import useAppBarHeight from '../misc/useAppBarHeight';

export const CompanyEmpty = () => {
    const appbarHeight = useAppBarHeight();
    return (
        <Box
            className="flex flex-col justify-center items-center gap-6"
            style={{ height: `calc(100dvh - ${appbarHeight}px)` }}
        >
            <img src="./img/empty.svg" alt="No companies found" />
            <Box className="flex flex-col gap-0 items-center">
                <h2 className="text-lg font-bold text-gray-900">
                    No companies found
                </h2>
                <p className="text-sm text-center text-gray-600 mb-2">
                    It seems your company list is empty.
                </p>
            </Box>
            <Box className="flex gap-2">
                <CreateButton variant="contained" label="Create Company" />
            </Box>
        </Box>
    );
};
