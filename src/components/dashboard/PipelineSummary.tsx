import { HomepageCard } from '../ui-kit/HomepageCard'

export function PipelineSummary() {
  return (
    <HomepageCard className="h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Summary</h3>
      
      <div className="space-y-4">
        <div className="text-2xl font-bold text-gray-900">$45,200</div>
        <div className="text-sm text-gray-600">in active opportunities</div>
        
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">5 ready to close</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">8 in follow-up stage</span>
        </div>
      </div>
    </HomepageCard>
  )
}