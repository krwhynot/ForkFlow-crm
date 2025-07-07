import { DashboardCard } from '../../core/patterns/DashboardCard';

export function PriorityOrganizations() {
  return (
    <DashboardCard 
      title="A-Priority Organizations"
      value="15"
      subtitle="organizations requiring immediate attention"
      className="h-full"
    >
      <div className="flex flex-wrap gap-2 text-sm mt-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">8 pending samples</span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">4 quotes requested</span>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">3 follow-ups</span>
      </div>
    </DashboardCard>
  )
}