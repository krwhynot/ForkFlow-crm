import { useListContext, RecordContextProvider } from 'react-admin';
import { OrganizationCard } from '../common/OrganizationCard';
import { Organization } from '../../types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const ImageList = () => {
    const { data, isLoading } = useListContext<Organization>();
    const isMobile = useBreakpoint('sm');
    const isTablet = useBreakpoint('md');

    if (isLoading) return null;

    // Determine grid spacing and columns based on screen size
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-1 mb-2 px-1">
            {data?.map((record) => (
                <div key={record.id} className="flex">
                    <RecordContextProvider value={record}>
                        <OrganizationCard />
                    </RecordContextProvider>
                </div>
            ))}
        </div>
    );
};
