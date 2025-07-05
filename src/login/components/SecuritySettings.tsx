/**
 * Security Settings Component
 * Displays security information and session management
 */

import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from '@/components/ui-kit';
import { ClockIcon as AccessTimeIcon, DevicePhoneMobileIcon as DeviceHubIcon, ShieldCheckIcon as SecurityIcon, CheckBadgeIcon as VerifiedIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { RoleChip } from '../../components/auth/RoleChip';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { User } from '../../types';

interface SecuritySettingsProps {
    user: User;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
    const isMobile = useBreakpoint('sm');

    const formatLastLogin = (lastLogin?: string) => {
        if (!lastLogin) return 'Never';
        return new Date(lastLogin).toLocaleString();
    };

    const getAccountAge = (createdAt: string) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diffInDays = Math.floor(
            (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffInDays < 1) return 'Less than a day';
        if (diffInDays === 1) return '1 day';
        if (diffInDays < 30) return `${diffInDays} days`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
        return `${Math.floor(diffInDays / 365)} years`;
    };

    const getSecurityScore = () => {
        let score = 0;
        let maxScore = 5;

        // Account status
        if (user.isActive) score += 1;

        // Has avatar (indicates engaged user)
        if (user.avatar) score += 1;

        // Has principals assigned
        if (user.principals && user.principals.length > 0) score += 1;

        // Recent login activity
        if (user.lastLoginAt) {
            const lastLogin = new Date(user.lastLoginAt);
            const daysSinceLogin =
                (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLogin < 30) score += 1;
        }

        return { score, maxScore };
    };

    const { score, maxScore } = getSecurityScore();
    const securityPercentage = Math.round((score / maxScore) * 100);

    const getSecurityLevel = () => {
        if (securityPercentage >= 80)
            return { level: 'High', color: 'success' as const };
        if (securityPercentage >= 60)
            return { level: 'Medium', color: 'warning' as const };
        return { level: 'Low', color: 'error' as const };
    };

    const { level, color } = getSecurityLevel();

    return (
        <Stack className="gap-3">
            <Typography variant="h6" gutterBottom>
                Security & Account Information
            </Typography>

            {/* Security Score Card */}
            <Card variant="outlined">
                <CardContent>
                    <Box className="flex items-center gap-2 mb-2">
                        <SecurityIcon className={`h-6 w-6 text-${color}`} />
                        <Box>
                            <Typography variant="h6">
                                Security Level:{' '}
                                <Chip
                                    label={level}
                                    color={color}
                                    size="small"
                                />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {securityPercentage}% secure ({score}/{maxScore}{' '}
                                criteria met)
                            </Typography>
                        </Box>
                    </Box>

                    {securityPercentage < 80 && (
                        <Alert severity="info" className="mt-2">
                            <Typography variant="body2">
                                <strong>Improve your security:</strong> Complete
                                your profile with avatar and principal assignments for better account security.
                            </Typography>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Account Information */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Account Information
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <VerifiedIcon className={`h-6 w-6 text-${user.isActive ? 'success' : 'error'}`} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Account Status"
                                secondary={
                                    <Chip
                                        label={
                                            user.isActive
                                                ? 'Active'
                                                : 'Inactive'
                                        }
                                        color={
                                            user.isActive ? 'success' : 'error'
                                        }
                                        size="small"
                                    />
                                }
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <AccessTimeIcon className="h-6 w-6 text-gray-500" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Last Login"
                                secondary={formatLastLogin(user.lastLoginAt)}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <DeviceHubIcon className="h-6 w-6 text-gray-500" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Account Created"
                                secondary={`${new Date(user.createdAt).toLocaleDateString()} (${getAccountAge(user.createdAt)} ago)`}
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Role & Permissions
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="User Role"
                                secondary={<RoleChip role={user.role} />}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary="Principals/Brands"
                                secondary={
                                    user.principals &&
                                        user.principals.length > 0 ? (
                                        <Box className="flex gap-0.5 flex-wrap mt-0.5">
                                            {user.principals.map(principal => (
                                                <Chip
                                                    key={principal}
                                                    label={principal}
                                                    size="small"
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        'No principals assigned'
                                    )
                                }
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* Security Recommendations */}
            <Alert severity="info">
                <Typography variant="body2">
                    <strong>Security Best Practices:</strong>
                    <br />
                    • Log out when using shared devices
                    <br />
                    • Use strong, unique passwords
                    <br />
                    • Keep your profile information up to date
                    <br />• Report any suspicious activity to your administrator
                </Typography>
            </Alert>
        </Stack>
    );
};
