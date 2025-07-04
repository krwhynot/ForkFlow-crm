import { CreateButton } from 'react-admin';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

export const CustomerEmpty = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-12 text-center">
        <BuildingOffice2Icon className="h-20 w-20 text-gray-300 mb-4" />
        <h4 className="text-2xl font-bold mb-2">No customers yet</h4>
        <p className="text-gray-500 mb-4">
            Start building your customer base by adding restaurants, grocery
            stores, and other food businesses
        </p>
        <div className="mt-4">
            <CreateButton
                variant="contained"
                label="Add First Customer"
                className="min-h-[44px] px-6 py-3"
            />
        </div>
    </div>
);
