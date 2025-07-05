import React from 'react';
import { Card, Title, Text, Button } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { UserIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const NewlyAddedContactsWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: contacts, isLoading } = useGetList('contacts', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'created_at', order: 'DESC' },
    filter: {
      created_by: identity?.id
    }
  });

  if (isLoading) {
    return (
      <Card className="h-80">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-80 overflow-hidden">
      <Title className="mb-4">Newly Added Contacts</Title>
      
      <div className="space-y-3 mb-4">
        {contacts?.map((contact) => (
          <div key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
            {/* Custom Avatar */}
            <div className="w-10 h-10 bg-tremor-brand rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <Text className="font-medium text-tremor-content-strong truncate">
                {contact.first_name} {contact.last_name}
              </Text>
              <Text className="text-xs text-tremor-content truncate">
                {contact.company} • {format(new Date(contact.created_at), 'MMM d')}
              </Text>
            </div>
          </div>
        ))}
        
        {!contacts?.length && (
          <div className="text-center py-8">
            <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <Text className="text-tremor-content">No recent contacts</Text>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => window.location.href = '/contacts'}
        >
          View All Contacts
        </Button>
      </div>
    </Card>
  );
};

export const NewlyAddedContactsWidget = React.memo(NewlyAddedContactsWidgetComponent);