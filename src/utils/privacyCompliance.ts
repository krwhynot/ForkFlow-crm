// src/utils/privacyCompliance.ts

/**
 * Privacy compliance utilities for GDPR, CCPA, and other data protection regulations
 */

export interface PrivacySettings {
    gdprCompliance: boolean;
    ccpaCompliance: boolean;
    cookieConsent: boolean;
    dataRetentionDays: number;
    automaticDeletion: boolean;
    anonymizeData: boolean;
    consentRequired: boolean;
    rightToDelete: boolean;
    rightToPortability: boolean;
    rightToRectification: boolean;
    rightToRestriction: boolean;
    dataProcessingLogging: boolean;
}

export interface ConsentRecord {
    userId: string;
    consentType: 'cookies' | 'marketing' | 'analytics' | 'necessary';
    granted: boolean;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    consentMethod: 'explicit' | 'implied' | 'legitimate_interest';
    purpose: string;
    retention?: string;
}

export interface DataProcessingLog {
    id: string;
    userId: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'anonymize';
    dataType: string;
    purpose: string;
    legalBasis:
        | 'consent'
        | 'contract'
        | 'legal_obligation'
        | 'vital_interest'
        | 'public_task'
        | 'legitimate_interest';
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
}

export interface PrivacyRequest {
    id: string;
    userId: string;
    requestType:
        | 'access'
        | 'delete'
        | 'portability'
        | 'rectification'
        | 'restriction'
        | 'objection';
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    requestDate: string;
    completionDate?: string;
    details: string;
    response?: string;
    verificationMethod?: string;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
    gdprCompliance: true,
    ccpaCompliance: true,
    cookieConsent: true,
    dataRetentionDays: 2555, // 7 years
    automaticDeletion: true,
    anonymizeData: true,
    consentRequired: true,
    rightToDelete: true,
    rightToPortability: true,
    rightToRectification: true,
    rightToRestriction: true,
    dataProcessingLogging: true,
};

/**
 * Privacy Compliance Manager
 */
export class PrivacyComplianceManager {
    private settings: PrivacySettings;
    private consentRecords: Map<string, ConsentRecord[]> = new Map();
    private processingLogs: DataProcessingLog[] = [];
    private privacyRequests: Map<string, PrivacyRequest[]> = new Map();

    constructor(settings?: Partial<PrivacySettings>) {
        this.settings = { ...DEFAULT_PRIVACY_SETTINGS, ...settings };
    }

    /**
     * Record user consent
     */
    recordConsent(consent: Omit<ConsentRecord, 'timestamp'>): void {
        const record: ConsentRecord = {
            ...consent,
            timestamp: new Date().toISOString(),
        };

        const userConsents = this.consentRecords.get(consent.userId) || [];
        userConsents.push(record);
        this.consentRecords.set(consent.userId, userConsents);

        // Log this as a data processing activity
        this.logDataProcessing({
            userId: consent.userId,
            action: 'create',
            dataType: 'consent_record',
            purpose: 'Privacy compliance and consent management',
            legalBasis: 'consent',
            details: {
                consentType: consent.consentType,
                granted: consent.granted,
            },
        });
    }

    /**
     * Check if user has given consent for specific purpose
     */
    hasConsent(
        userId: string,
        consentType: ConsentRecord['consentType']
    ): boolean {
        const userConsents = this.consentRecords.get(userId) || [];
        const latestConsent = userConsents
            .filter(consent => consent.consentType === consentType)
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            )[0];

        return latestConsent?.granted || false;
    }

    /**
     * Get all consents for a user
     */
    getUserConsents(userId: string): ConsentRecord[] {
        return this.consentRecords.get(userId) || [];
    }

    /**
     * Withdraw consent
     */
    withdrawConsent(
        userId: string,
        consentType: ConsentRecord['consentType'],
        method: string = 'user_request'
    ): void {
        this.recordConsent({
            userId,
            consentType,
            granted: false,
            consentMethod: 'explicit',
            purpose: 'Consent withdrawal',
            userAgent: navigator.userAgent,
        });

        // Log withdrawal
        this.logDataProcessing({
            userId,
            action: 'update',
            dataType: 'consent_record',
            purpose: 'Consent withdrawal',
            legalBasis: 'consent',
            details: { consentType, method, action: 'withdrawn' },
        });
    }

    /**
     * Log data processing activity
     */
    logDataProcessing(log: Omit<DataProcessingLog, 'id' | 'timestamp'>): void {
        if (!this.settings.dataProcessingLogging) return;

        const record: DataProcessingLog = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...log,
        };

        this.processingLogs.push(record);

        // In production, this would be sent to a secure logging service
        console.log('Data processing logged:', record);
    }

    /**
     * Get data processing logs for a user
     */
    getUserProcessingLogs(userId: string): DataProcessingLog[] {
        return this.processingLogs.filter(log => log.userId === userId);
    }

    /**
     * Submit privacy request
     */
    submitPrivacyRequest(
        request: Omit<PrivacyRequest, 'id' | 'requestDate' | 'status'>
    ): string {
        const privacyRequest: PrivacyRequest = {
            id: this.generateId(),
            requestDate: new Date().toISOString(),
            status: 'pending',
            ...request,
        };

        const userRequests = this.privacyRequests.get(request.userId) || [];
        userRequests.push(privacyRequest);
        this.privacyRequests.set(request.userId, userRequests);

        // Log the privacy request
        this.logDataProcessing({
            userId: request.userId,
            action: 'create',
            dataType: 'privacy_request',
            purpose: 'Data subject rights fulfillment',
            legalBasis: 'legal_obligation',
            details: {
                requestType: request.requestType,
                requestId: privacyRequest.id,
            },
        });

        return privacyRequest.id;
    }

    /**
     * Process data access request (GDPR Article 15)
     */
    async processAccessRequest(userId: string): Promise<any> {
        this.logDataProcessing({
            userId,
            action: 'read',
            dataType: 'personal_data',
            purpose: 'Data access request fulfillment',
            legalBasis: 'legal_obligation',
        });

        // In production, this would collect all user data from various sources
        return {
            personalData: {
                userId,
                // Include all personal data stored for the user
            },
            consents: this.getUserConsents(userId),
            processingLogs: this.getUserProcessingLogs(userId),
            privacyRequests: this.getUserPrivacyRequests(userId),
        };
    }

    /**
     * Process data deletion request (GDPR Article 17 - Right to be Forgotten)
     */
    async processDeleteRequest(
        userId: string,
        verificationPassed: boolean = false
    ): Promise<boolean> {
        if (!this.settings.rightToDelete) {
            throw new Error('Data deletion not supported');
        }

        if (!verificationPassed) {
            throw new Error('User verification required for data deletion');
        }

        // Log deletion request
        this.logDataProcessing({
            userId,
            action: 'delete',
            dataType: 'all_personal_data',
            purpose: 'Right to be forgotten request',
            legalBasis: 'legal_obligation',
        });

        // In production, this would:
        // 1. Delete user data from all systems
        // 2. Anonymize data that must be retained for legal reasons
        // 3. Remove data from backups (where possible)
        // 4. Notify third parties about the deletion

        return true;
    }

    /**
     * Process data portability request (GDPR Article 20)
     */
    async processPortabilityRequest(userId: string): Promise<any> {
        if (!this.settings.rightToPortability) {
            throw new Error('Data portability not supported');
        }

        this.logDataProcessing({
            userId,
            action: 'export',
            dataType: 'personal_data',
            purpose: 'Data portability request',
            legalBasis: 'legal_obligation',
        });

        // Return data in a structured, portable format
        const userData = await this.processAccessRequest(userId);

        return {
            format: 'JSON',
            exportDate: new Date().toISOString(),
            data: userData,
        };
    }

    /**
     * Anonymize user data
     */
    anonymizeUserData(userId: string): any {
        if (!this.settings.anonymizeData) return null;

        this.logDataProcessing({
            userId,
            action: 'anonymize',
            dataType: 'personal_data',
            purpose: 'Data retention policy compliance',
            legalBasis: 'legitimate_interest',
        });

        // In production, this would anonymize data while preserving analytics value
        return {
            userId: this.generateAnonymousId(),
            anonymizedAt: new Date().toISOString(),
            originalUserId: userId, // For audit purposes only
        };
    }

    /**
     * Check data retention compliance
     */
    checkDataRetention(): Array<{
        userId: string;
        action: 'delete' | 'anonymize';
        reason: string;
    }> {
        if (!this.settings.automaticDeletion) return [];

        const actions: Array<{
            userId: string;
            action: 'delete' | 'anonymize';
            reason: string;
        }> = [];
        const cutoffDate = new Date();
        cutoffDate.setDate(
            cutoffDate.getDate() - this.settings.dataRetentionDays
        );

        // In production, this would check all user accounts for retention policy compliance
        // For now, return empty array as this is a mock implementation

        return actions;
    }

    /**
     * Get privacy requests for a user
     */
    getUserPrivacyRequests(userId: string): PrivacyRequest[] {
        return this.privacyRequests.get(userId) || [];
    }

    /**
     * Generate cookie consent banner configuration
     */
    getCookieConsentConfig(): any {
        if (!this.settings.cookieConsent) return null;

        return {
            necessary: {
                title: 'Necessary Cookies',
                description: 'Essential for the website to function properly',
                required: true,
                cookies: ['session', 'csrf_token', 'auth'],
            },
            analytics: {
                title: 'Analytics Cookies',
                description:
                    'Help us understand how visitors interact with our website',
                required: false,
                cookies: ['google_analytics', 'performance_monitoring'],
            },
            marketing: {
                title: 'Marketing Cookies',
                description:
                    'Used to deliver personalized content and advertisements',
                required: false,
                cookies: ['advertising_id', 'social_media_pixels'],
            },
        };
    }

    /**
     * Validate privacy settings compliance
     */
    validateCompliance(): {
        isCompliant: boolean;
        issues: string[];
        recommendations: string[];
    } {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check GDPR compliance
        if (this.settings.gdprCompliance) {
            if (!this.settings.consentRequired) {
                issues.push(
                    'GDPR requires explicit consent for data processing'
                );
            }
            if (!this.settings.rightToDelete) {
                issues.push(
                    'GDPR requires right to be forgotten implementation'
                );
            }
            if (!this.settings.rightToPortability) {
                issues.push('GDPR requires data portability rights');
            }
            if (!this.settings.dataProcessingLogging) {
                recommendations.push(
                    'Enable data processing logging for GDPR compliance'
                );
            }
        }

        // Check data retention
        if (this.settings.dataRetentionDays > 2555) {
            // 7 years
            recommendations.push(
                'Consider shorter data retention period for better privacy'
            );
        }

        // Check cookie consent
        if (this.settings.cookieConsent && !this.settings.consentRequired) {
            issues.push('Cookie consent requires proper consent management');
        }

        return {
            isCompliant: issues.length === 0,
            issues,
            recommendations,
        };
    }

    /**
     * Generate privacy policy content
     */
    generatePrivacyPolicyContent(): any {
        return {
            lastUpdated: new Date().toISOString(),
            sections: {
                dataCollection: {
                    title: 'Data We Collect',
                    content:
                        'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.',
                },
                dataUse: {
                    title: 'How We Use Your Data',
                    content:
                        'We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.',
                },
                dataSharing: {
                    title: 'Data Sharing',
                    content:
                        'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.',
                },
                dataRetention: {
                    title: 'Data Retention',
                    content: `We retain your personal information for ${this.settings.dataRetentionDays} days from your last activity, unless a longer retention period is required by law.`,
                },
                userRights: {
                    title: 'Your Rights',
                    content:
                        'You have the right to access, update, delete, or restrict the use of your personal information. You may also request data portability.',
                },
                cookies: {
                    title: 'Cookies',
                    content:
                        'We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.',
                },
                contact: {
                    title: 'Contact Information',
                    content:
                        'If you have questions about this privacy policy or our data practices, please contact us.',
                },
            },
            compliance: {
                gdpr: this.settings.gdprCompliance,
                ccpa: this.settings.ccpaCompliance,
                features: {
                    rightToAccess: true,
                    rightToDelete: this.settings.rightToDelete,
                    rightToPortability: this.settings.rightToPortability,
                    rightToRectification: this.settings.rightToRectification,
                    cookieConsent: this.settings.cookieConsent,
                },
            },
        };
    }

    /**
     * Helper methods
     */
    private generateId(): string {
        return (
            Math.random().toString(36).substring(2) + Date.now().toString(36)
        );
    }

    private generateAnonymousId(): string {
        return 'anon_' + Math.random().toString(36).substring(2, 15);
    }
}

// Global privacy manager instance
export const privacyManager = new PrivacyComplianceManager();

export default {
    PrivacyComplianceManager,
    privacyManager,
    DEFAULT_PRIVACY_SETTINGS,
};
