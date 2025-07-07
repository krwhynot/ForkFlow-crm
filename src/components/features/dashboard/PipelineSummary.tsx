import { DashboardCard } from '../../core/patterns/DashboardCard';

export function PipelineSummary() {
  return (
    <DashboardCard
      title="Pipeline Summary"
      value="$45,200"
      subtitle="in active opportunities"
      className="h-full"
    >
      <div className="flex flex-wrap gap-2 text-sm mt-4">
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">5 ready to close</span>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">8 in follow-up stage</span>
      </div>
    </DashboardCard>
  )
}