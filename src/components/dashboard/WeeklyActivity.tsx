import { HomepageCard } from '../ui-kit/HomepageCard'

export function WeeklyActivity() {
  return (
    <HomepageCard className="h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Activity</h3>
      
      <div className="space-y-4">
        <div className="text-2xl font-bold text-gray-900">23</div>
        <div className="text-sm text-gray-600">interactions logged</div>
        
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">12 calls</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">8 emails</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">3 in-person visits</span>
        </div>
      </div>
    </HomepageCard>
  )
}