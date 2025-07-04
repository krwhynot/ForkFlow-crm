/**
 * Security Middleware for ForkFlow CRM
 * Implements CSRF protection, rate limiting, and request validation
 */

import { logAuditEvent } from './auditLogging';
import { generateCSRFToken, checkRateLimit } from './jwtUtils';

export interface SecurityConfig {
    csrfProtection: boolean;
    rateLimitingEnabled: boolean;
    requestValidation: boolean;
    contentSecurityPolicy: boolean;
    httpSecurityHeaders: boolean;
    xssProtection: boolean;
    sqlInjectionProtection: boolean;
}

export interface RequestContext {
    method: string;
    url: string;
    headers: Headers;
    body?: any;
    userAgent?: string;
    ipAddress?: string;
    userId?: string;
    sessionId?: string;
}

export interface SecurityViolation {
    type: 'csrf' | 'rate_limit' | 'xss' | 'sql_injection' | 'malformed_request';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details: Record<string, any>;
    blocked: boolean;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
    csrfProtection: true,
    rateLimitingEnabled: true,
    requestValidation: true,
    contentSecurityPolicy: true,
    httpSecurityHeaders: true,
    xssProtection: true,
    sqlInjectionProtection: true,
};

// CSRF token storage
let currentCSRFToken: string | null = null;
const CSRF_TOKEN_KEY = 'forkflow_csrf_token';

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Security patterns
const XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
];

const SQL_INJECTION_PATTERNS = [
    /('|(\\'))|(;)|(\||(\*)|(%)|(\-)|(\+)|(\/)){2,}/gi,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/gi,
    /\b(or|and)\s+\d+\s*=\s*\d+/gi,
    /\b(or|and)\s+['"].*?['"]\s*=\s*['"].*?['"]/gi,
    /\/\*.*?\*\//gi,
    /\-\-.*$/gm,
];

/**
 * Initialize security middleware
 */
export const initializeSecurity = (
    config: Partial<SecurityConfig> = {}
): SecurityConfig => {
    const securityConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };

    // Initialize CSRF token
    if (securityConfig.csrfProtection) {
        initializeCSRFProtection();
    }

    // Setup Content Security Policy
    if (securityConfig.contentSecurityPolicy) {
        setupContentSecurityPolicy();
    }

    // Setup HTTP security headers
    if (securityConfig.httpSecurityHeaders) {
        setupSecurityHeaders();
    }

    logAuditEvent('system.startup', {
        securityConfig,
        message: 'Security middleware initialized',
    });

    return securityConfig;
};

/**
 * Initialize CSRF protection
 */
const initializeCSRFProtection = (): void => {
    // Generate initial CSRF token
    currentCSRFToken = generateCSRFToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, currentCSRFToken);

    // Set meta tag for forms
    let metaTag = document.querySelector(
        'meta[name="csrf-token"]'
    ) as HTMLMetaElement;
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'csrf-token';
        document.head.appendChild(metaTag);
    }
    metaTag.content = currentCSRFToken;
};

/**
 * Get current CSRF token
 */
export const getCSRFToken = (): string => {
    if (!currentCSRFToken) {
        currentCSRFToken =
            sessionStorage.getItem(CSRF_TOKEN_KEY) || generateCSRFToken();
        sessionStorage.setItem(CSRF_TOKEN_KEY, currentCSRFToken);
    }
    return currentCSRFToken;
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string): boolean => {
    const expectedToken = getCSRFToken();
    return token === expectedToken;
};

/**
 * Setup Content Security Policy
 */
const setupContentSecurityPolicy = (): void => {
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
    ].join('; ');

    // Add CSP meta tag
    let metaTag = document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]'
    ) as HTMLMetaElement;
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.httpEquiv = 'Content-Security-Policy';
        document.head.appendChild(metaTag);
    }
    metaTag.content = cspDirectives;
};

/**
 * Setup HTTP security headers (for development info)
 */
const setupSecurityHeaders = (): void => {
    // Log recommended security headers for server configuration
    const recommendedHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
        'Strict-Transport-Security':
            'max-age=31536000; includeSubDomains; preload',
    };

    if (process.env.NODE_ENV === 'development') {
        console.log(
            '🔒 Recommended HTTP Security Headers for server:',
            recommendedHeaders
        );
    }
};

/**
 * Validate request security
 */
export const validateRequestSecurity = async (
    context: RequestContext,
    config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): Promise<SecurityViolation[]> => {
    const violations: SecurityViolation[] = [];

    try {
        // CSRF Protection
        if (config.csrfProtection && isStateChangingMethod(context.method)) {
            const csrfToken = context.headers.get('X-CSRF-Token');
            if (!csrfToken || !validateCSRFToken(csrfToken)) {
                const violation: SecurityViolation = {
                    type: 'csrf',
                    severity: 'critical',
                    message: 'CSRF token validation failed',
                    details: {
                        method: context.method,
                        url: context.url,
                        hasToken: !!csrfToken,
                    },
                    blocked: true,
                };
                violations.push(violation);

                await logAuditEvent(
                    'security.csrf_violation',
                    violation.details,
                    {
                        severity: 'critical',
                        outcome: 'failure',
                        userId: context.userId,
                        sessionId: context.sessionId,
                    }
                );
            }
        }

        // Rate Limiting
        if (config.rateLimitingEnabled && context.ipAddress) {
            const rateLimitViolation = checkRequestRateLimit(
                context.ipAddress,
                context.url
            );
            if (rateLimitViolation) {
                violations.push(rateLimitViolation);

                await logAuditEvent(
                    'security.rate_limit_exceeded',
                    {
                        ipAddress: context.ipAddress,
                        url: context.url,
                        method: context.method,
                    },
                    {
                        severity: 'high',
                        outcome: 'failure',
                        userId: context.userId,
                    }
                );
            }
        }

        // XSS Protection
        if (config.xssProtection && context.body) {
            const xssViolation = detectXSSAttempt(context.body);
            if (xssViolation) {
                violations.push(xssViolation);

                await logAuditEvent(
                    'security.xss_attempt',
                    {
                        url: context.url,
                        method: context.method,
                        suspiciousContent: xssViolation.details.pattern,
                    },
                    {
                        severity: 'critical',
                        outcome: 'failure',
                        userId: context.userId,
                    }
                );
            }
        }

        // SQL Injection Protection
        if (config.sqlInjectionProtection && context.body) {
            const sqlViolation = detectSQLInjectionAttempt(context.body);
            if (sqlViolation) {
                violations.push(sqlViolation);

                await logAuditEvent(
                    'security.sql_injection_attempt',
                    {
                        url: context.url,
                        method: context.method,
                        suspiciousContent: sqlViolation.details.pattern,
                    },
                    {
                        severity: 'critical',
                        outcome: 'failure',
                        userId: context.userId,
                    }
                );
            }
        }

        // Request Validation
        if (config.requestValidation) {
            const validationViolation = validateRequestFormat(context);
            if (validationViolation) {
                violations.push(validationViolation);

                await logAuditEvent(
                    'security.malformed_request',
                    {
                        url: context.url,
                        method: context.method,
                        issue: validationViolation.message,
                    },
                    {
                        severity: 'medium',
                        outcome: 'warning',
                        userId: context.userId,
                    }
                );
            }
        }
    } catch (error) {
        console.error('Security validation error:', error);

        const systemViolation: SecurityViolation = {
            type: 'malformed_request',
            severity: 'medium',
            message: 'Security validation failed',
            details: {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            blocked: false,
        };
        violations.push(systemViolation);
    }

    return violations;
};

/**
 * Check if method requires CSRF protection
 */
const isStateChangingMethod = (method: string): boolean => {
    return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
};

/**
 * Check rate limiting for requests
 */
const checkRequestRateLimit = (
    identifier: string,
    endpoint: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
): SecurityViolation | null => {
    const key = `${identifier}:${endpoint}`;
    const now = Date.now();
    const rateLimitData = rateLimitMap.get(key);

    if (!rateLimitData || now > rateLimitData.resetTime) {
        // Reset or initialize rate limit
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return null;
    }

    rateLimitData.count++;

    if (rateLimitData.count > maxRequests) {
        return {
            type: 'rate_limit',
            severity: 'high',
            message: `Rate limit exceeded for ${endpoint}`,
            details: {
                identifier,
                endpoint,
                count: rateLimitData.count,
                limit: maxRequests,
                resetTime: rateLimitData.resetTime,
            },
            blocked: true,
        };
    }

    return null;
};

/**
 * Detect XSS attempts
 */
const detectXSSAttempt = (content: any): SecurityViolation | null => {
    const contentStr = JSON.stringify(content).toLowerCase();

    for (const pattern of XSS_PATTERNS) {
        if (pattern.test(contentStr)) {
            return {
                type: 'xss',
                severity: 'critical',
                message: 'Potential XSS attempt detected',
                details: {
                    pattern: pattern.source,
                    content: contentStr.substr(0, 200), // Limited content for logging
                },
                blocked: true,
            };
        }
    }

    return null;
};

/**
 * Detect SQL injection attempts
 */
const detectSQLInjectionAttempt = (content: any): SecurityViolation | null => {
    const contentStr = JSON.stringify(content).toLowerCase();

    for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(contentStr)) {
            return {
                type: 'sql_injection',
                severity: 'critical',
                message: 'Potential SQL injection attempt detected',
                details: {
                    pattern: pattern.source,
                    content: contentStr.substr(0, 200), // Limited content for logging
                },
                blocked: true,
            };
        }
    }

    return null;
};

/**
 * Validate request format
 */
const validateRequestFormat = (
    context: RequestContext
): SecurityViolation | null => {
    // Check for extremely large payloads
    if (context.body && JSON.stringify(context.body).length > 1024 * 1024) {
        // 1MB limit
        return {
            type: 'malformed_request',
            severity: 'medium',
            message: 'Request payload too large',
            details: {
                size: JSON.stringify(context.body).length,
                limit: 1024 * 1024,
            },
            blocked: true,
        };
    }

    // Check for suspicious user agents
    if (context.userAgent) {
        const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
        const agentLower = context.userAgent.toLowerCase();

        if (suspiciousAgents.some(agent => agentLower.includes(agent))) {
            return {
                type: 'malformed_request',
                severity: 'low',
                message: 'Suspicious user agent detected',
                details: {
                    userAgent: context.userAgent,
                },
                blocked: false,
            };
        }
    }

    return null;
};

/**
 * Create secure HTTP client wrapper
 */
export const createSecureHttpClient = (
    baseURL: string,
    config: SecurityConfig = DEFAULT_SECURITY_CONFIG
) => {
    return async (
        url: string,
        options: RequestInit = {}
    ): Promise<Response> => {
        const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
        const headers = new Headers(options.headers);

        // Add CSRF token for state-changing requests
        if (
            config.csrfProtection &&
            isStateChangingMethod(options.method || 'GET')
        ) {
            headers.set('X-CSRF-Token', getCSRFToken());
        }

        // Add security headers
        headers.set('X-Requested-With', 'XMLHttpRequest');
        headers.set('Cache-Control', 'no-cache');

        // Create request context for validation
        const context: RequestContext = {
            method: options.method || 'GET',
            url: fullURL,
            headers,
            body: options.body ? JSON.parse(options.body as string) : undefined,
            userAgent: navigator.userAgent,
        };

        // Validate request security
        const violations = await validateRequestSecurity(context, config);

        // Block request if critical violations found
        const criticalViolations = violations.filter(v => v.blocked);
        if (criticalViolations.length > 0) {
            const error = new Error(
                `Security violation: ${criticalViolations[0].message}`
            );
            (error as any).violations = violations;
            throw error;
        }

        // Make the request
        const response = await fetch(fullURL, {
            ...options,
            headers,
        });

        // Log successful request
        if (response.ok) {
            await logAuditEvent(
                'data.read',
                {
                    method: context.method,
                    url: fullURL,
                    status: response.status,
                },
                {
                    severity: 'low',
                    outcome: 'success',
                }
            );
        }

        return response;
    };
};

/**
 * Get security statistics
 */
export const getSecurityStatistics = (): {
    activeRateLimits: number;
    recentViolations: number;
    csrfTokenAge: number;
    securityLevel: 'low' | 'medium' | 'high';
} => {
    const now = Date.now();
    const activeRateLimits = Array.from(rateLimitMap.values()).filter(
        data => now < data.resetTime
    ).length;

    const csrfTokenAge = currentCSRFToken
        ? now - parseInt(currentCSRFToken.substr(-8), 16)
        : 0;

    // Calculate security level based on various factors
    let securityLevel: 'low' | 'medium' | 'high' = 'medium';

    if (activeRateLimits > 10 || csrfTokenAge > 24 * 60 * 60 * 1000) {
        securityLevel = 'low';
    } else if (activeRateLimits === 0 && csrfTokenAge < 60 * 60 * 1000) {
        securityLevel = 'high';
    }

    return {
        activeRateLimits,
        recentViolations: 0, // Would come from audit log analysis
        csrfTokenAge,
        securityLevel,
    };
};
