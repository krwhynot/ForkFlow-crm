import Man2Icon from '@mui/icons-material/Man2';
import WcIcon from '@mui/icons-material/Wc';
import Woman2Icon from '@mui/icons-material/Woman2';

export const defaultLogo = './logos/logo_atomic_crm.svg';

export const defaultTitle = 'ForkFlow CRM';

export const defaultCompanySectors = [
    'Fine Dining',
    'Fast Food',
    'Healthcare',
    'Catering',
    'Institutional',
];

export const defaultDealStages = [
    { value: 'lead_discovery', label: 'Lead Discovery' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'sampled_visited', label: 'Sampled/Visited' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'close', label: 'Close' },
];

export const defaultDealPipelineStatuses = ['won'];

export const defaultDealCategories = [
    'Other',
    'Copywriting',
    'Print project',
    'UI Design',
    'Website design',
];

export const defaultNoteStatuses = [
    { value: 'cold', label: 'Cold', color: '#7dbde8' },
    { value: 'warm', label: 'Warm', color: '#e8cb7d' },
    { value: 'hot', label: 'Hot', color: '#e88b7d' },
    { value: 'in-contract', label: 'In Contract', color: '#a4e87d' },
];

export const defaultTaskTypes = [
    'Email',
    'Call',
    'In Person',
    'Demo',
    'Quote',
    'Follow-up',
];

export const defaultContactGender = [
    { value: 'male', label: 'He/Him', icon: Man2Icon },
    { value: 'female', label: 'She/Her', icon: Woman2Icon },
    { value: 'nonbinary', label: 'They/Them', icon: WcIcon },
];
