// src/utils/apiSecurity.ts

/**
 * API security utilities for request/response protection
 */

import { validateTextInput, validateEmail, SecurityRiskLevel } from './securityValidation';

export interface APISecurityConfig {
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        maxLoginAttempts: number;
        skipSuccessfulRequests: boolean;
    };
    auth: {
        sessionTimeout: number;
        maxConcurrentSessions: number;
        requireMFA: boolean;
        strongPasswordRequired: boolean;
    };
    validation: {
        maxBodySize: number;
        allowedFileTypes: string[];
        maxFileSize: number;
        sanitizeInput: boolean;
    };
    monitoring: {
        logAllRequests: boolean;
        logFailedRequests: boolean;
        alertOnSuspiciousActivity: boolean;
        maxFailureRate: number;
    };
}

const DEFAULT_SECURITY_CONFIG: APISecurityConfig = {
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        maxLoginAttempts: 5,
        skipSuccessfulRequests: false,
    },
    auth: {
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxConcurrentSessions: 3,
        requireMFA: false,
        strongPasswordRequired: true,
    },
    validation: {
        maxBodySize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.csv', '.xlsx'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        sanitizeInput: true,
    },
    monitoring: {
        logAllRequests: false,
        logFailedRequests: true,
        alertOnSuspiciousActivity: true,
        maxFailureRate: 0.1, // 10%
    },
};

/**
 * Request sanitization and validation
 */
export class APIRequestValidator {
    private config: APISecurityConfig;

    constructor(config?: Partial<APISecurityConfig>) {
        this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
    }

    /**
     * Validate and sanitize request body
     */
    validateRequestBody(body: any, schema?: Record<string, any>): {
        isValid: boolean;
        sanitized: any;
        errors: string[];
        riskScore: number;
    } {
        const errors: string[] = [];
        let riskScore = 0;
        let sanitized = body;

        try {
            // Check body size
            const bodySize = JSON.stringify(body).length;
            if (bodySize > this.config.validation.maxBodySize) {
                errors.push(`Request body too large: ${bodySize} bytes (max: ${this.config.validation.maxBodySize})`);
                riskScore += 30;
            }

            // Recursively validate and sanitize object properties
            if (typeof body === 'object' && body !== null) {
                sanitized = this.sanitizeObject(body);
                const validation = this.validateObjectSecurity(body);
                errors.push(...validation.errors);
                riskScore += validation.riskScore;
            }

            // Apply schema validation if provided
            if (schema) {
                const schemaValidation = this.validateAgainstSchema(sanitized, schema);
                errors.push(...schemaValidation.errors);
                riskScore += schemaValidation.riskScore;
            }

        } catch (error) {
            errors.push('Invalid request body format');
            riskScore += 50;
        }

        return {
            isValid: errors.length === 0,
            sanitized,
            errors,
            riskScore: Math.min(riskScore, 100)
        };
    }

    /**
     * Sanitize object recursively
     */
    private sanitizeObject(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }
        
        if (typeof obj === 'object') {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(obj)) {
                // Sanitize key
                const cleanKey = this.sanitizeString(key);
                
                // Sanitize value
                if (typeof value === 'string') {
                    sanitized[cleanKey] = this.sanitizeString(value);
                } else {
                    sanitized[cleanKey] = this.sanitizeObject(value);
                }
            }
            return sanitized;
        }
        
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }
        
        return obj;
    }

    /**
     * Sanitize string input
     */
    private sanitizeString(input: string): string {
        if (!this.config.validation.sanitizeInput) return input;
        
        const validation = validateTextInput(input, {
            allowHtml: false,
            allowSpecialChars: false
        });
        
        return validation.sanitized || input;
    }

    /**
     * Validate object for security issues
     */
    private validateObjectSecurity(obj: any): { errors: string[]; riskScore: number } {
        const errors: string[] = [];
        let riskScore = 0;

        const checkValue = (value: any, path: string = '') => {
            if (typeof value === 'string') {
                const validation = validateTextInput(value);
                if (!validation.isValid) {
                    errors.push(`Security issue in ${path}: ${validation.errors.join(', ')}`);
                }
                
                if (validation.riskLevel === SecurityRiskLevel.HIGH) {
                    riskScore += 30;
                } else if (validation.riskLevel === SecurityRiskLevel.CRITICAL) {
                    riskScore += 60;
                }
            } else if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        checkValue(item, `${path}[${index}]`);
                    });
                } else {
                    Object.entries(value).forEach(([key, val]) => {
                        checkValue(val, path ? `${path}.${key}` : key);
                    });
                }
            }
        };

        checkValue(obj);
        return { errors, riskScore };
    }

    /**
     * Validate against schema
     */
    private validateAgainstSchema(data: any, schema: Record<string, any>): { errors: string[]; riskScore: number } {
        const errors: string[] = [];
        let riskScore = 0;

        // Basic schema validation (in production, use a proper schema validator like Joi or Zod)
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`Field '${field}' is required`);
                continue;
            }

            if (value !== undefined && value !== null) {
                // Type validation
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`Field '${field}' must be of type ${rules.type}`);
                    riskScore += 10;
                }

                // String length validation
                if (rules.type === 'string' && typeof value === 'string') {
                    if (rules.minLength && value.length < rules.minLength) {
                        errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
                    }
                    if (rules.maxLength && value.length > rules.maxLength) {
                        errors.push(`Field '${field}' must not exceed ${rules.maxLength} characters`);
                        riskScore += 5;
                    }
                }

                // Number range validation
                if (rules.type === 'number' && typeof value === 'number') {
                    if (rules.min !== undefined && value < rules.min) {
                        errors.push(`Field '${field}' must be at least ${rules.min}`);
                    }
                    if (rules.max !== undefined && value > rules.max) {
                        errors.push(`Field '${field}' must not exceed ${rules.max}`);
                    }
                }

                // Email validation
                if (rules.format === 'email' && typeof value === 'string') {
                    const emailValidation = validateEmail(value);
                    if (!emailValidation.isValid) {
                        errors.push(`Field '${field}' must be a valid email address`);
                    }
                }
            }
        }

        return { errors, riskScore };
    }
}

/**
 * API response security wrapper
 */
export class APIResponseSecurer {
    /**
     * Sanitize response data before sending
     */
    static sanitizeResponse(data: any, options?: {
        removeNulls?: boolean;
        removeEmpty?: boolean;
        hideSensitiveFields?: boolean;
    }): any {
        const {
            removeNulls = false,
            removeEmpty = false,
            hideSensitiveFields = true
        } = options || {};

        const sensitiveFields = [
            'password', 'secret', 'token', 'key', 'hash',
            'ssn', 'credit_card', 'api_key', 'private'
        ];

        const sanitize = (obj: any): any => {
            if (obj === null || obj === undefined) {
                return removeNulls ? undefined : obj;
            }

            if (Array.isArray(obj)) {
                const sanitized = obj.map(sanitize).filter(item => item !== undefined);
                return removeEmpty && sanitized.length === 0 ? undefined : sanitized;
            }

            if (typeof obj === 'object') {
                const sanitized: any = {};
                
                for (const [key, value] of Object.entries(obj)) {
                    // Hide sensitive fields
                    if (hideSensitiveFields && sensitiveFields.some(field => 
                        key.toLowerCase().includes(field)
                    )) {
                        sanitized[key] = '[REDACTED]';
                        continue;
                    }

                    const sanitizedValue = sanitize(value);
                    
                    if (sanitizedValue !== undefined) {
                        sanitized[key] = sanitizedValue;
                    } else if (!removeNulls && !removeEmpty) {
                        sanitized[key] = sanitizedValue;
                    }
                }

                return Object.keys(sanitized).length === 0 && removeEmpty ? undefined : sanitized;
            }

            return obj;
        };

        return sanitize(data);
    }

    /**
     * Add security headers to response
     */
    static addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
        return {
            ...headers,
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
    }

    /**
     * Create standardized error response
     */
    static createErrorResponse(
        error: string | Error,
        statusCode: number = 500,
        details?: any
    ): {
        error: string;
        message: string;
        statusCode: number;
        timestamp: string;
        details?: any;
    } {
        const errorMessage = error instanceof Error ? error.message : error;
        
        return {
            error: 'API_ERROR',
            message: errorMessage,
            statusCode,
            timestamp: new Date().toISOString(),
            ...(details && { details: this.sanitizeResponse(details) })
        };
    }
}

/**
 * API Security Monitor
 */
export class APISecurityMonitor {
    private requestCounts = new Map<string, { count: number; lastReset: number }>();
    private failureCounts = new Map<string, { count: number; lastReset: number }>();

    /**
     * Check rate limiting
     */
    checkRateLimit(
        identifier: string,
        endpoint: string,
        config: APISecurityConfig['rateLimit']
    ): { allowed: boolean; remaining: number; resetTime: number } {
        const key = `${identifier}_${endpoint}`;
        const now = Date.now();
        const windowStart = now - config.windowMs;

        let entry = this.requestCounts.get(key);
        if (!entry || entry.lastReset < windowStart) {
            entry = { count: 0, lastReset: now };
        }

        const isLoginEndpoint = endpoint.includes('login') || endpoint.includes('auth');
        const limit = isLoginEndpoint ? config.maxLoginAttempts : config.maxRequests;

        if (entry.count >= limit) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.lastReset + config.windowMs
            };
        }

        entry.count++;
        this.requestCounts.set(key, entry);

        return {
            allowed: true,
            remaining: limit - entry.count,
            resetTime: entry.lastReset + config.windowMs
        };
    }

    /**
     * Record API failure
     */
    recordFailure(identifier: string, endpoint: string): void {
        const key = `${identifier}_${endpoint}`;
        const now = Date.now();

        let entry = this.failureCounts.get(key);
        if (!entry) {
            entry = { count: 0, lastReset: now };
        }

        entry.count++;
        this.failureCounts.set(key, entry);
    }

    /**
     * Check if identifier should be blocked due to failures
     */
    shouldBlock(identifier: string, maxFailures: number = 10): boolean {
        let totalFailures = 0;
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        for (const [key, entry] of this.failureCounts.entries()) {
            if (key.startsWith(identifier) && (now - entry.lastReset) < oneHour) {
                totalFailures += entry.count;
            }
        }

        return totalFailures >= maxFailures;
    }

    /**
     * Get security metrics
     */
    getMetrics(): {
        totalRequests: number;
        totalFailures: number;
        activeIdentifiers: number;
        topFailureEndpoints: Array<{ endpoint: string; failures: number }>;
    } {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        let totalRequests = 0;
        let totalFailures = 0;
        const activeIdentifiers = new Set<string>();
        const endpointFailures = new Map<string, number>();

        for (const [key, entry] of this.requestCounts.entries()) {
            if ((now - entry.lastReset) < oneHour) {
                totalRequests += entry.count;
                activeIdentifiers.add(key.split('_')[0]);
            }
        }

        for (const [key, entry] of this.failureCounts.entries()) {
            if ((now - entry.lastReset) < oneHour) {
                totalFailures += entry.count;
                const endpoint = key.split('_').slice(1).join('_');
                endpointFailures.set(endpoint, (endpointFailures.get(endpoint) || 0) + entry.count);
            }
        }

        const topFailureEndpoints = Array.from(endpointFailures.entries())
            .map(([endpoint, failures]) => ({ endpoint, failures }))
            .sort((a, b) => b.failures - a.failures)
            .slice(0, 10);

        return {
            totalRequests,
            totalFailures,
            activeIdentifiers: activeIdentifiers.size,
            topFailureEndpoints
        };
    }
}

// Global instances
export const apiValidator = new APIRequestValidator();
export const apiMonitor = new APISecurityMonitor();

export default {
    APIRequestValidator,
    APIResponseSecurer,
    APISecurityMonitor,
    apiValidator,
    apiMonitor,
    DEFAULT_SECURITY_CONFIG
};