import { Setting } from '../../../types';
import { Db } from './types';

// Utility to safely convert a value to ISO string, fallback to now if invalid
const safeDate = (value: any) => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const generateSettings = (db: Db): Setting[] => {
    const settings: Setting[] = [];

    // Priority settings
    const priorities = [
        { label: 'Low', color: '#4CAF50', sortOrder: 1 },
        { label: 'Medium', color: '#FF9800', sortOrder: 2 },
        { label: 'High', color: '#F44336', sortOrder: 3 },
        { label: 'Critical', color: '#9C27B0', sortOrder: 4 },
    ];

    priorities.forEach((priority, index) => {
        settings.push({
            id: index + 1,
            category: 'priority',
            key: priority.label.toLowerCase(),
            label: priority.label,
            color: priority.color,
            sortOrder: priority.sortOrder,
            active: true,
            createdAt: safeDate(new Date()),
            updatedAt: safeDate(new Date()),
        });
    });

    // Segment settings
    const segments = [
        { label: 'Restaurant', color: '#2196F3', sortOrder: 1 },
        { label: 'Grocery', color: '#4CAF50', sortOrder: 2 },
        { label: 'Distributor', color: '#FF9800', sortOrder: 3 },
    ];

    segments.forEach((segment, index) => {
        settings.push({
            id: index + 5,
            category: 'segment',
            key: segment.label.toLowerCase(),
            label: segment.label,
            color: segment.color,
            sortOrder: segment.sortOrder,
            active: true,
            createdAt: safeDate(new Date()),
            updatedAt: safeDate(new Date()),
        });
    });

    // Distributor settings
    const distributors = [
        { label: 'Sysco', color: '#1976D2', sortOrder: 1 },
        { label: 'US Foods', color: '#388E3C', sortOrder: 2 },
        { label: 'Performance Food Group', color: '#F57C00', sortOrder: 3 },
        { label: 'McLane', color: '#7B1FA2', sortOrder: 4 },
        { label: 'KeHE', color: '#303F9F', sortOrder: 5 },
    ];

    distributors.forEach((distributor, index) => {
        settings.push({
            id: index + 8,
            category: 'distributor',
            key: distributor.label.toLowerCase().replace(/\s+/g, '_'),
            label: distributor.label,
            color: distributor.color,
            sortOrder: distributor.sortOrder,
            active: true,
            createdAt: safeDate(new Date()),
            updatedAt: safeDate(new Date()),
        });
    });

    // Role settings for contacts
    const roles = [
        { label: 'CEO', color: '#9C27B0', sortOrder: 1 },
        { label: 'Owner', color: '#673AB7', sortOrder: 2 },
        { label: 'Manager', color: '#3F51B5', sortOrder: 3 },
        { label: 'Chef', color: '#2196F3', sortOrder: 4 },
        { label: 'Purchasing', color: '#009688', sortOrder: 5 },
        { label: 'Admin', color: '#4CAF50', sortOrder: 6 },
    ];

    roles.forEach((role, index) => {
        settings.push({
            id: index + 13,
            category: 'role',
            key: role.label.toLowerCase(),
            label: role.label,
            color: role.color,
            sortOrder: role.sortOrder,
            active: true,
            createdAt: safeDate(new Date()),
            updatedAt: safeDate(new Date()),
        });
    });

    // Influence level settings
    const influences = [
        { label: 'High', color: '#F44336', sortOrder: 1 },
        { label: 'Medium', color: '#FF9800', sortOrder: 2 },
        { label: 'Low', color: '#4CAF50', sortOrder: 3 },
    ];

    influences.forEach((influence, index) => {
        settings.push({
            id: index + 19,
            category: 'influence',
            key: influence.label.toLowerCase(),
            label: influence.label,
            color: influence.color,
            sortOrder: influence.sortOrder,
            active: true,
            createdAt: safeDate(new Date()),
            updatedAt: safeDate(new Date()),
        });
    });

    // Decision role settings
    const decisions = [
        { label: 'Decision Maker', color: '#9C27B0', sortOrder: 1 },
        { label: 'Influencer', color: '#3F51B5', sortOrder: 2 },
        { label: 'Gatekeeper', color: '#FF9800', sortOrder: 3 },
        { label: 'User', color: '#4CAF50', sortOrder: 4 },
    ];

    decisions.forEach((decision, index) => {
        settings.push({
            id: index + 22,
            category: 'decision',
            key: decision.label.toLowerCase().replace(/\s+/g, '_'),
            label: decision.label,
            color: decision.color,
            sortOrder: decision.sortOrder,
            active: true,
            createdAt: safeDate(new Date()),
            updatedAt: safeDate(new Date()),
        });
    });

    // Principal settings (Food service brand principals)
    const principals = [
        {
            label: 'Sysco Corporation',
            key: 'sysco',
            color: '#1F5281',
            sortOrder: 1,
        },
        { label: 'US Foods', key: 'us_foods', color: '#CC0000', sortOrder: 2 },
        {
            label: 'Performance Food Group',
            key: 'pfg',
            color: '#F4AE1A',
            sortOrder: 3,
        },
        {
            label: 'McLane Company',
            key: 'mclane',
            color: '#004B87',
            sortOrder: 4,
        },
        {
            label: 'United Natural Foods Inc.',
            key: 'unfi',
            color: '#1E8A36',
            sortOrder: 5,
        },
        {
            label: 'C&S Wholesale Grocers',
            key: 'cs_wholesale',
            color: '#E2231A',
            sortOrder: 6,
        },
        {
            label: 'Gordon Food Service',
            key: 'gordon_food',
            color: '#003B73',
            sortOrder: 7,
        },
        { label: 'Tyson Foods', key: 'tyson', color: '#FF0000', sortOrder: 8 },
        {
            label: 'Maines Paper & Food Service',
            key: 'maines',
            color: '#1E90FF',
            sortOrder: 9,
        },
        {
            label: 'Reinhart Foodservice',
            key: 'reinhart',
            color: '#FF8C00',
            sortOrder: 10,
        },
        {
            label: 'Reyes Holdings',
            key: 'reyes',
            color: '#FF0000',
            sortOrder: 11,
        },
    ];

    principals.forEach((principal, index) => {
        settings.push({
            id: index + 26,
            category: 'principal',
            key: principal.key,
            label: principal.label,
            color: principal.color,
            sortOrder: principal.sortOrder,
            active: true,
            createdAt: safeDate(new Date()),
            updatedAt: safeDate(new Date()),
        });
    });

    return settings;
};
