import { useEffect, useState } from 'react';
import { HomepageCard } from '../ui-kit/HomepageCard';
import { HomepageOrganization, HomepageContact } from '../../types';

interface FollowUp {
    organization: HomepageOrganization;
    contact: HomepageContact;
}

export function TodaysFollowups() {
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const fetchFollowUps = async () => {
        try {
            // Use mock data instead of API call to avoid 400 errors
            // TODO: Re-enable API call when database schema is properly configured
            const mockFollowUps: FollowUp[] = [
                {
                    organization: {
                        id: '1',
                        name: "Romano's Italian Bistro",
                        priority: 'A',
                        created_at: '',
                        updated_at: '',
                    },
                    contact: {
                        id: '1',
                        organization_id: '1',
                        name: 'Chef Marcus',
                        role: 'Chef',
                        is_primary: true,
                        created_at: '',
                        updated_at: '',
                    },
                },
                {
                    organization: {
                        id: '2',
                        name: "St. Mary's Hospital",
                        priority: 'B',
                        created_at: '',
                        updated_at: '',
                    },
                    contact: {
                        id: '2',
                        organization_id: '2',
                        name: 'Food Director',
                        role: 'Food Director',
                        is_primary: true,
                        created_at: '',
                        updated_at: '',
                    },
                },
                {
                    organization: {
                        id: '3',
                        name: 'Metro Catering Co.',
                        priority: 'A',
                        created_at: '',
                        updated_at: '',
                    },
                    contact: {
                        id: '3',
                        organization_id: '3',
                        name: 'Operations Manager',
                        role: 'Operations Manager',
                        is_primary: true,
                        created_at: '',
                        updated_at: '',
                    },
                },
            ];

            setFollowUps(mockFollowUps);
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityIndicator = (priority: string) => {
        const colors = {
            A: 'bg-green-500',
            B: 'bg-yellow-500',
            C: 'bg-orange-500',
            D: 'bg-red-500',
        };
        return colors[priority as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <HomepageCard className="h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today's Follow-ups
            </h3>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {followUps.map((followUp, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-3"
                        >
                            <div
                                className={`h-3 w-3 rounded-full ${getPriorityIndicator(followUp.organization.priority)}`}
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                    {followUp.organization.name} -{' '}
                                    {followUp.contact.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </HomepageCard>
    );
}
