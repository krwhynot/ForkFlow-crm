/**
 * Security Status Bar Component
 * Shows security status and session information in the app header
 */

import React, { useState } from 'react';
import {
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useGetIdentity } from 'react-admin';
import { User } from '../../types';
import { RoleChip } from '../auth/RoleChip';
import { Badge } from '../ui-kit/Badge';
import { Chip } from '../ui-kit/Chip';
import { Tooltip } from '../ui-kit/Tooltip';

interface SecurityStatusBarProps {
    showDetails?: boolean;
    compact?: boolean;
}

interface SecurityStatus {
    level: 'high' | 'medium' | 'low' | 'critical';
    score: number;
    issues: string[];
    recommendations: string[];
}

export const SecurityStatusBar: React.FC<SecurityStatusBarProps> = ({
    showDetails = true,
    compact = false,
}) => {
    const { data: identity } = useGetIdentity();
    const isMobile = window.innerWidth < 640; // Tailwind 'sm' breakpoint

    const getSecurityStatus = (): SecurityStatus => {
        if (!identity) {
            return {
                level: 'critical',
                score: 0,
                issues: ['No user identity'],
                recommendations: ['Please log in again'],
            };
        }

        let score = 0;
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check account completeness
        if (identity.firstName && identity.lastName) score += 20;
        else {
            issues.push('Incomplete profile');
            recommendations.push('Complete your profile information');
        }

        // Check role assignment
        if (identity.role) score += 20;
        else {
            issues.push('No role assigned');
            recommendations.push('Contact admin for role assignment');
        }

        // Check territory assignment for brokers
        if (identity.role === 'broker') {
            if (identity.territory && identity.territory.length > 0) score += 20;
            else {
                issues.push('No territory assigned');
                recommendations.push('Get territory assignment from manager');
            }
        } else {
            score += 20; // Non-brokers don't need territory
        }

        // Check recent activity
        if (identity.lastLoginAt) {
            const lastLogin = new Date(identity.lastLoginAt);
            const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLogin < 7) score += 20;
            else {
                issues.push('Inactive account');
                recommendations.push('Regular login recommended for security');
            }
        } else {
            issues.push('No login history');
            recommendations.push('Establish regular login pattern');
        }

        // Check account status
        if (identity.isActive) score += 20;
        else {
            issues.push('Account disabled');
            recommendations.push('Contact administrator');
        }

        // Determine security level
        let level: SecurityStatus['level'];
        if (score >= 90) level = 'high';
        else if (score >= 70) level = 'medium';
        else if (score >= 50) level = 'low';
        else level = 'critical';

        return { level, score, issues, recommendations };
    };

    const securityStatus = getSecurityStatus();

    const getStatusIcon = () => {
        switch (securityStatus.level) {
            case 'high':
                return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
            case 'medium':
                return <ShieldCheckIcon className="h-4 w-4 text-yellow-600" />;
            case 'low':
                return <ShieldExclamationIcon className="h-4 w-4 text-yellow-600" />;
            case 'critical':
                return <XCircleIcon className="h-4 w-4 text-red-600" />;
            default:
                return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = () => {
        switch (securityStatus.level) {
            case 'high':
                return 'success' as const;
            case 'medium':
                return 'warning' as const;
            case 'low':
                return 'warning' as const;
            case 'critical':
                return 'error' as const;
            default:
                return 'secondary' as const;
        }
    };

    const getStatusText = () => {
        switch (securityStatus.level) {
            case 'high':
                return 'Secure';
            case 'medium':
                return 'Good';
            case 'low':
                return 'Needs Attention';
            case 'critical':
                return 'Critical';
            default:
                return 'Unknown';
        }
    };

    const getTooltipContent = () => {
        return (
            <div className="p-2">
                <div className="mb-2">
                    <strong>Security Score: {securityStatus.score}/100</strong>
                </div>
                {securityStatus.issues.length > 0 && (
                    <div className="mb-2">
                        <strong>Issues:</strong>
                        <ul className="m-0 pl-4">
                            {securityStatus.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {securityStatus.recommendations.length > 0 && (
                    <div>
                        <strong>Recommendations:</strong>
                        <ul className="m-0 pl-4">
                            {securityStatus.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    if (compact || isMobile) {
        return (
            <Tooltip content={getTooltipContent()}>
                <Badge
                    badgeContent={securityStatus.issues.length || null}
                    color="error"
                    variant="dot"
                    invisible={securityStatus.level === 'high'}
                >
                    <Chip
                        icon={getStatusIcon()}
                        label={securityStatus.score}
                        color={getStatusColor()}
                        size="small"
                        variant="outlined"
                    />
                </Badge>
            </Tooltip>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {showDetails && identity && (
                <RoleChip role={identity.role} size="small" variant="outlined" />
            )}
            
            <Tooltip content={getTooltipContent()}>
                <Badge
                    badgeContent={securityStatus.issues.length || null}
                    color="error"
                    variant="dot"
                    invisible={securityStatus.level === 'high'}
                >
                    <Chip
                        icon={getStatusIcon()}
                        label={`${getStatusText()} (${securityStatus.score})`}
                        color={getStatusColor()}
                        size="small"
                        variant="outlined"
                        className="cursor-help hover:scale-105 transition-transform"
                    />
                </Badge>
            </Tooltip>
        </div>
    );
};

export default SecurityStatusBar;