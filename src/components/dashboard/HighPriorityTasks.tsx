import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Card } from '../ui-kit/Card';
import { Chip } from '../ui-kit/Chip';
import { Typography } from '../ui-kit/Typography';

interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    organization?: string;
}

// Mock data - replace with actual hook
const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Follow up with Olive Garden on new product line',
        status: 'pending',
        dueDate: '2024-01-15',
        priority: 'high',
        organization: 'Olive Garden'
    },
    {
        id: '2',
        title: 'Prepare quarterly report for Sysco',
        status: 'in_progress',
        dueDate: '2024-01-16',
        priority: 'high',
        organization: 'Sysco'
    },
    {
        id: '3',
        title: 'Schedule meeting with Whole Foods buyer',
        status: 'pending',
        dueDate: '2024-01-17',
        priority: 'medium',
        organization: 'Whole Foods'
    }
];

const getStatusIcon = (status: Task['status']) => {
    switch (status) {
        case 'completed':
            return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        case 'in_progress':
            return <ClockIcon className="w-5 h-5 text-blue-500" />;
        default:
            return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
    }
};

const getStatusColor = (status: Task['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-orange-100 text-orange-800';
    }
};

const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function HighPriorityTasks() {
    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                        High Priority Tasks
                    </Typography>
                    <Chip className="bg-red-100 text-red-800 text-xs">
                        {mockTasks.filter(t => t.priority === 'high').length} High Priority
                    </Chip>
                </div>

                <div className="space-y-3">
                    {mockTasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    // Handle task click
                                }
                            }}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(task.status)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <Typography variant="body2" className="font-medium text-gray-900 mb-1">
                                    {task.title}
                                </Typography>

                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Chip className={getStatusColor(task.status)}>
                                        {task.status.replace('_', ' ')}
                                    </Chip>
                                    <Chip className={getPriorityColor(task.priority)}>
                                        {task.priority}
                                    </Chip>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{task.organization}</span>
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 transition-colors">
                        View All Tasks
                    </button>
                </div>
            </div>
        </Card>
    );
} 