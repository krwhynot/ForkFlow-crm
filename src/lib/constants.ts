export const INTERACTION_TYPES = [
  { value: 'Email', label: 'Email', icon: '📧' },
  { value: 'Call', label: 'Call', icon: '📞' },
  { value: 'In Person', label: 'In Person', icon: '👥' },
  { value: 'Demo/Sample', label: 'Demo/Sample', icon: '🍽️' },
  { value: 'Quote', label: 'Quote', icon: '💰' },
  { value: 'Follow-up', label: 'Follow-up', icon: '📋' }
] as const;

export const PRIORITY_LEVELS = ['A', 'B', 'C', 'D'] as const;

export const FOOD_SERVICE_SEGMENTS = [
  'Fine Dining',
  'Fast Food',
  'Healthcare',
  'Catering',
  'Institutional'
] as const;

export const DISTRIBUTORS = [
  'Sysco',
  'USF',
  'PFG',
  'Direct',
  'Other'
] as const;