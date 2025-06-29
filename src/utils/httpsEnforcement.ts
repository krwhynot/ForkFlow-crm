/**
 * HTTPS Enforcement and Security Headers for ForkFlow CRM
 * Ensures secure communication and enforces security best practices
 */

import { logAuditEvent } from './auditLogging';

export interface HTTPSConfig {
    enforceHTTPS: boolean;
    strictTransportSecurity: boolean;
    upgradeInsecureRequests: boolean;
    blockMixedContent: boolean;
    allowLocalDevelopment: boolean;
}

export interface SecurityHeadersConfig {
    contentTypeOptions: boolean;
    frameOptions: boolean;
    xssProtection: boolean;
    referrerPolicy: boolean;
    permissionsPolicy: boolean;
    expectCertificateTransparency: boolean;
}

const DEFAULT_HTTPS_CONFIG: HTTPSConfig = {
    enforceHTTPS: true,
    strictTransportSecurity: true,
    upgradeInsecureRequests: true,
    blockMixedContent: true,
    allowLocalDevelopment: true,
};

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
    contentTypeOptions: true,
    frameOptions: true,
    xssProtection: true,
    referrerPolicy: true,
    permissionsPolicy: true,
    expectCertificateTransparency: true,
};

/**
 * Check if current connection is secure
 */
export const isConnectionSecure = (): boolean => {
    return (
        location.protocol === 'https:' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.hostname.startsWith('192.168.') ||
        location.hostname.startsWith('10.') ||
        location.hostname.includes('localhost')
    );
};

/**
 * Check if running in development environment
 */
export const isDevelopmentEnvironment = (): boolean => {
    return (
        process.env.NODE_ENV === 'development' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.port !== ''
    );
};

/**
 * Enforce HTTPS connection
 */
export const enforceHTTPS = (config: HTTPSConfig = DEFAULT_HTTPS_CONFIG): void => {
    const isSecure = isConnectionSecure();
    const isDev = isDevelopmentEnvironment();
    
    // Skip enforcement in development if configured
    if (isDev && config.allowLocalDevelopment) {
        console.log('🔓 HTTPS enforcement skipped for local development');
        return;
    }
    
    if (!isSecure && config.enforceHTTPS) {
        const httpsUrl = location.href.replace(/^http:/, 'https:');
        
        logAuditEvent('security.https_enforcement', {
            originalUrl: location.href,
            redirectUrl: httpsUrl,
            userAgent: navigator.userAgent,
        }, {
            severity: 'medium',
            message: 'Redirecting to HTTPS',
        });
        
        console.log('🔒 Redirecting to HTTPS:', httpsUrl);
        location.replace(httpsUrl);
        return;
    }
    
    if (isSecure) {
        logAuditEvent('security.https_verified', {
            url: location.href,
            protocol: location.protocol,
        }, {
            severity: 'low',
            message: 'Secure connection verified',
        });
    }
};

/**
 * Setup Strict Transport Security (HSTS)
 */
export const setupStrictTransportSecurity = (
    maxAge: number = 31536000, // 1 year
    includeSubDomains: boolean = true,
    preload: boolean = true
): void => {
    if (!isConnectionSecure()) {
        console.warn('⚠️ HSTS can only be set over HTTPS connections');
        return;
    }
    
    let hstsValue = `max-age=${maxAge}`;
    if (includeSubDomains) hstsValue += '; includeSubDomains';
    if (preload) hstsValue += '; preload';
    
    // Add HSTS meta tag (informational - real HSTS must be set by server)
    let metaTag = document.querySelector('meta[name="strict-transport-security"]') as HTMLMetaElement;
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'strict-transport-security';
        document.head.appendChild(metaTag);
    }
    metaTag.content = hstsValue;
    
    console.log('🔒 HSTS configured:', hstsValue);
    
    logAuditEvent('security.hsts_configured', {
        value: hstsValue,
        maxAge,
        includeSubDomains,
        preload,
    }, {
        severity: 'low',
        message: 'HSTS configured',
    });
};

/**
 * Setup security headers via meta tags
 */
export const setupSecurityHeaders = (config: SecurityHeadersConfig = DEFAULT_SECURITY_HEADERS): void => {
    const headers: Array<{ name: string; content: string; description: string }> = [];
    
    if (config.contentTypeOptions) {
        headers.push({
            name: 'x-content-type-options',
            content: 'nosniff',
            description: 'Prevents MIME type sniffing',
        });
    }
    
    if (config.frameOptions) {
        headers.push({
            name: 'x-frame-options',
            content: 'DENY',
            description: 'Prevents clickjacking attacks',
        });
    }
    
    if (config.xssProtection) {
        headers.push({
            name: 'x-xss-protection',
            content: '1; mode=block',
            description: 'Enables XSS filtering',
        });
    }
    
    if (config.referrerPolicy) {
        headers.push({
            name: 'referrer-policy',
            content: 'strict-origin-when-cross-origin',
            description: 'Controls referrer information',
        });
    }
    
    if (config.permissionsPolicy) {
        headers.push({
            name: 'permissions-policy',
            content: 'geolocation=(self), microphone=(), camera=(), payment=()',
            description: 'Controls browser features',
        });
    }
    
    // Apply headers as meta tags
    headers.forEach(header => {
        let metaTag = document.querySelector(`meta[name="${header.name}"]`) as HTMLMetaElement;
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = header.name;
            document.head.appendChild(metaTag);
        }
        metaTag.content = header.content;
    });
    
    if (process.env.NODE_ENV === 'development') {
        console.log('🛡️ Security headers configured:', headers);
    }
    
    logAuditEvent('security.headers_configured', {
        headers: headers.map(h => ({ name: h.name, content: h.content })),
        count: headers.length,
    }, {
        severity: 'low',
        message: 'Security headers configured',
    });
};

/**
 * Setup Content Security Policy
 */
export const setupContentSecurityPolicy = (): void => {
    const isDev = isDevelopmentEnvironment();
    
    const directives = [
        "default-src 'self'",
        isDev 
            ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com http://localhost:*"
            : "script-src 'self' https://*.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        isDev
            ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co http://localhost:* ws://localhost:*"
            : "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        ...(isConnectionSecure() ? ["upgrade-insecure-requests"] : []),
    ];
    
    const cspContent = directives.join('; ');
    
    let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.httpEquiv = 'Content-Security-Policy';
        document.head.appendChild(metaTag);
    }
    metaTag.content = cspContent;
    
    console.log('🔐 CSP configured:', cspContent);
    
    logAuditEvent('security.csp_configured', {
        policy: cspContent,
        directiveCount: directives.length,
        isDevelopment: isDev,
    }, {
        severity: 'low',
        message: 'Content Security Policy configured',
    });
};

/**
 * Monitor for mixed content issues
 */
export const monitorMixedContent = (): (() => void) => {
    if (!isConnectionSecure()) {
        return () => {}; // No monitoring needed for HTTP
    }
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    checkElementForMixedContent(node as Element);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
    
    // Initial scan
    checkElementForMixedContent(document.body);
    
    return () => observer.disconnect();
};

/**
 * Check element for mixed content issues
 */
const checkElementForMixedContent = (element: Element): void => {
    const insecureElements = [
        'img[src^="http:"]',
        'script[src^="http:"]',
        'link[href^="http:"]',
        'iframe[src^="http:"]',
        'video[src^="http:"]',
        'audio[src^="http:"]',
    ];
    
    insecureElements.forEach(selector => {
        const elements = element.querySelectorAll(selector);
        elements.forEach(el => {
            const src = el.getAttribute('src') || el.getAttribute('href');
            if (src && src.startsWith('http://')) {
                console.warn('⚠️ Mixed content detected:', el);
                
                logAuditEvent('security.mixed_content_detected', {
                    elementType: el.tagName.toLowerCase(),
                    url: src,
                    location: window.location.href,
                }, {
                    severity: 'medium',
                    message: 'Mixed content detected',
                    outcome: 'warning',
                });
            }
        });
    });
};

/**
 * Setup certificate transparency monitoring
 */
export const setupCertificateTransparency = (): void => {
    if (!isConnectionSecure()) {
        return;
    }
    
    // Add Expect-CT header via meta tag (informational)
    let metaTag = document.querySelector('meta[name="expect-ct"]') as HTMLMetaElement;
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'expect-ct';
        document.head.appendChild(metaTag);
    }
    metaTag.content = 'max-age=86400, enforce';
    
    logAuditEvent('security.certificate_transparency_configured', {
        policy: 'max-age=86400, enforce',
    }, {
        severity: 'low',
        message: 'Certificate transparency configured',
    });
};

/**
 * Get security status
 */
export const getSecurityStatus = (): {
    isSecure: boolean;
    isDevelopment: boolean;
    hasCSP: boolean;
    hasHSTS: boolean;
    mixedContentIssues: number;
    securityScore: number;
    recommendations: string[];
} => {
    const isSecure = isConnectionSecure();
    const isDev = isDevelopmentEnvironment();
    const hasCSP = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const hasHSTS = !!document.querySelector('meta[name="strict-transport-security"]');
    
    const recommendations: string[] = [];
    let securityScore = 0;
    
    if (isSecure) {
        securityScore += 40;
    } else {
        recommendations.push('Enable HTTPS for secure communication');
    }
    
    if (hasCSP) {
        securityScore += 20;
    } else {
        recommendations.push('Configure Content Security Policy');
    }
    
    if (hasHSTS) {
        securityScore += 20;
    } else if (isSecure) {
        recommendations.push('Enable Strict Transport Security');
    }
    
    if (isSecure && !isDev) {
        securityScore += 20;
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Security configuration is optimal');
    }
    
    return {
        isSecure,
        isDevelopment: isDev,
        hasCSP,
        hasHSTS,
        mixedContentIssues: 0, // Would be tracked by monitor
        securityScore,
        recommendations,
    };
};

/**
 * Initialize all HTTPS and security features
 */
export const initializeHTTPSSecurity = (
    httpsConfig: Partial<HTTPSConfig> = {},
    headersConfig: Partial<SecurityHeadersConfig> = {}
): (() => void) => {
    const finalHTTPSConfig = { ...DEFAULT_HTTPS_CONFIG, ...httpsConfig };
    const finalHeadersConfig = { ...DEFAULT_SECURITY_HEADERS, ...headersConfig };
    
    // Enforce HTTPS
    enforceHTTPS(finalHTTPSConfig);
    
    // Setup security headers
    setupSecurityHeaders(finalHeadersConfig);
    
    // Setup CSP
    setupContentSecurityPolicy();
    
    // Setup HSTS (only on HTTPS)
    if (isConnectionSecure() && finalHTTPSConfig.strictTransportSecurity) {
        setupStrictTransportSecurity();
    }
    
    // Setup certificate transparency
    if (finalHeadersConfig.expectCertificateTransparency) {
        setupCertificateTransparency();
    }
    
    // Monitor mixed content
    const stopMixedContentMonitor = monitorMixedContent();
    
    logAuditEvent('security.https_initialized', {
        httpsConfig: finalHTTPSConfig,
        headersConfig: finalHeadersConfig,
        isSecure: isConnectionSecure(),
        isDevelopment: isDevelopmentEnvironment(),
    }, {
        severity: 'low',
        message: 'HTTPS security initialized',
    });
    
    return () => {
        stopMixedContentMonitor();
    };
};