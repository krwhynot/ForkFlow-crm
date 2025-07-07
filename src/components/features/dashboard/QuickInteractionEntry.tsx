import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input } from '../../core'
import { DashboardCard } from '../../core/patterns'
import { INTERACTION_TYPES } from '../../../lib/constants'
import { supabase } from '../../../providers/supabase/supabase'

interface QuickInteractionForm {
  type: string
  organization_id: string
  contact_id: string
  subject: string
  notes: string
  follow_up_date: string
}

export function QuickInteractionEntry() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuickInteractionForm>()

  const onSubmit = async (data: QuickInteractionForm) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('interactions')
        .insert([{
          type: data.type,
          organization_id: data.organization_id,
          contact_id: data.contact_id,
          subject: data.subject,
          notes: data.notes,
          follow_up_date: data.follow_up_date || null
        }])

      if (error) throw error

      reset()
      alert('Interaction saved successfully!')
    } catch (error) {
      console.error('Error saving interaction:', error)
      alert('Error saving interaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardCard
      title="Quick Interaction Entry (30-Second Target)"
      className="col-span-full"
    >

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Interaction Type Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {INTERACTION_TYPES.map((type) => (
            <Button
              key={type.value}
              type="button"
              variant="outlined"
              className="h-16 flex-col space-y-1 text-sm"
              onClick={() => {
                // Set the type in the form
                const typeInput = document.getElementById('interaction-type') as HTMLSelectElement
                if (typeInput) typeInput.value = type.value
              }}
            >
              <span className="text-xl">{type.icon}</span>
              <span>{type.label}</span>
            </Button>
          ))}
        </div>

        {/* Hidden type selector for form */}
        <select
          id="interaction-type"
          {...register('type', { required: 'Interaction type is required' })}
          className="hidden"
        >
          <option value="">Select type...</option>
          {INTERACTION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <select
              {...register('organization_id', { required: 'Organization is required' })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[48px]"
            >
              <option value="">Select Organization...</option>
              <option value="1">Romano's Italian Bistro (A)</option>
              <option value="2">St. Mary's Hospital (B)</option>
              <option value="3">Metro Catering Co. (A)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <select
              {...register('contact_id')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[48px]"
            >
              <option value="">Select Contact...</option>
              <option value="1">Chef Marcus</option>
              <option value="2">Food Director</option>
              <option value="3">Operations Manager</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <Input
            {...register('subject')}
            placeholder="Brief interaction summary..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register('notes')}
            placeholder="Quick notes about the interaction..."
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[48px]"
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="filled"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save Interaction'}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => reset()}
          >
            Clear
          </Button>
        </div>
      </form>
    </DashboardCard>
  )
}