import { DashboardCard } from '../../core/patterns/DashboardCard';

export function WeeklyActivity() {
  return (
    <DashboardCard 
      title="This Week's Activity"
      value="23"
      subtitle="interactions logged"
      className="h-full"
    >
      <div className="flex flex-wrap gap-2 text-sm mt-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">12 calls</span>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">8 emails</span>
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">3 in-person visits</span>
      </div>
    </DashboardCard>
  )
}