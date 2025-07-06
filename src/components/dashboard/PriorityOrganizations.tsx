import { HomepageCard } from '../ui-kit/HomepageCard'

export function PriorityOrganizations() {
  return (
    <HomepageCard className="h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">A-Priority Organizations</h3>
      
      <div className="space-y-4">
        <div className="text-2xl font-bold text-gray-900">15</div>
        <div className="text-sm text-gray-600">organizations requiring immediate attention</div>
        
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">8 pending samples</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">4 quotes requested</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">3 follow-ups</span>
        </div>
      </div>
    </HomepageCard>
  )
}