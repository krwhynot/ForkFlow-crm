import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'A': return 'text-green-600 bg-green-50'
    case 'B': return 'text-yellow-600 bg-yellow-50'
    case 'C': return 'text-orange-600 bg-orange-50'
    case 'D': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}