/**
 * Core Pattern Components
 * 
 * Reusable pattern components to reduce style complexity and consolidate
 * common layout patterns found in high-complexity components.
 */

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

export { FeatureList } from './FeatureList';
export type { FeatureListProps } from './FeatureList';

export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { TimelineItem } from './TimelineItem';
export type { TimelineItemProps } from './TimelineItem';

export { ActionButtonGroup } from './ActionButtonGroup';
export type { ActionButton, ActionButtonGroupProps } from './ActionButtonGroup';

export { DetailModal } from './DetailModal';
export type { DetailModalProps } from './DetailModal';

export { InfoField } from './InfoField';
export type { InfoFieldProps } from './InfoField';

export { PlaceholderSection } from './PlaceholderSection';
export type { PlaceholderSectionProps } from './PlaceholderSection';

export { QuickActionsBar } from './QuickActionsBar';
export type { QuickAction, QuickActionsBarProps } from './QuickActionsBar';

export { EntityListSection } from './EntityListSection';
export type { EntityItem, EntityListSectionProps } from './EntityListSection';

export { EntityAvatar } from './EntityAvatar';
export type { EntityAvatarProps } from './EntityAvatar';

/**
 * Pattern Components
 * Reusable component patterns and compositions
 */

// New reusable components based on wireframes
export { DashboardCard } from './DashboardCard';
export { DataTable } from './DataTable';
export { FormInput } from './FormInput';
export { QuickActionButton } from './QuickActionButton';

// Re-export types
export type { ActionButtonGroupProps, ActionButtonProps } from './ActionButtonGroup';
export type { DetailModalProps } from './DetailModal';
export type { EntityItem, EntityListSectionProps } from './EntityListSection';
export type { FeatureListProps } from './FeatureList';
export type { InfoFieldProps } from './InfoField';
export type { PageHeaderProps } from './PageHeader';
export type { PlaceholderSectionProps } from './PlaceholderSection';
export type { QuickActionProps, QuickActionsBarProps } from './QuickActionsBar';
export type { StatusBadgeProps } from './StatusBadge';
export type { TimelineItemProps } from './TimelineItem';

// New component types
export type { DashboardCardProps } from './DashboardCard';
export type { Column, DataTableProps, SortConfig } from './DataTable';
export type { FormInputProps } from './FormInput';
export type { QuickActionButtonProps } from './QuickActionButton';

// Style optimization components
export { EntityListItem } from './EntityListItem';
export { EntitySectionHeader } from './EntitySectionHeader';
export { MetricCard } from './MetricCard';
export { RoadmapItem } from './RoadmapItem';
export { QuickActionIcon } from './QuickActionIcon';
export type { EntityListItemProps } from './EntityListItem';
export type { EntitySectionHeaderProps } from './EntitySectionHeader';
export type { MetricCardProps } from './MetricCard';
export type { RoadmapItemProps } from './RoadmapItem';
export type { QuickActionIconProps } from './QuickActionIcon';
