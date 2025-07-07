import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Contact {
  id: string;
  name: string;
  company: string;
  avatar: string;
  addedAt: Date;
}

interface ContactsListProps {
  contacts: Contact[];
}

export const ContactsList: React.FC<ContactsListProps> = ({ contacts }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Newly Added Contacts
      </h3>
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-center">
            <img
              className="h-10 w-10 rounded-full"
              src={contact.avatar}
              alt={contact.name}
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {contact.name}
              </p>
              <p className="text-sm text-gray-500">{contact.company}</p>
            </div>
            <div className="text-sm text-gray-400">
              {formatDistanceToNow(contact.addedAt, { addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};