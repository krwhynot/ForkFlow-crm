import React from 'react';
import { Card, Text, Metric, Flex } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';

const ScheduledMeetingsWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const { data: meetings, isLoading } = useGetList('interactions', {
    pagination: { page: 1, perPage: 100 },
    filter: { 
      type: 'meeting',
      created_by: identity?.id,
      date: {
        $gte: startOfDay(today).toISOString(),
        $lte: endOfDay(nextWeek).toISOString()
      }
    },
  });

  const totalMeetings = meetings?.length || 0;
  const todayMeetings = meetings?.filter(
    meeting => {
      const meetingDate = new Date(meeting.date);
      return format(meetingDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    }
  ).length || 0;

  const nextMeeting = meetings?.find(meeting => {
    const meetingDate = new Date(meeting.date);
    return meetingDate >= today;
  });

  if (isLoading) {
    return (
      <Card className="h-44">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-32 hover:shadow-md transition-shadow bg-white border border-gray-200">
      <Flex alignItems="start" justifyContent="between" className="mb-4">
        <div className="truncate">
          <Text className="text-sm text-gray-600 font-medium">
            Scheduled Meetings
          </Text>
          <Metric className="text-2xl font-bold text-gray-900 mt-1">
            {totalMeetings}
          </Metric>
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </Flex>
      
      <div className="text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Today: {todayMeetings}</span>
          <span>This week: {totalMeetings}</span>
        </div>
        {nextMeeting && (
          <div className="mt-1 text-green-600 font-medium">
            Next: {format(new Date(nextMeeting.date), 'MMM d')}
          </div>
        )}
      </div>
    </Card>
  );
};

export const ScheduledMeetingsWidget = React.memo(ScheduledMeetingsWidgetComponent);