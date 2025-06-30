// src/utils/securityHeaders.ts

/**
 * Security headers configuration for enhanced application security
 */

export interface SecurityHeadersConfig {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    originAgentCluster: boolean;
    referrerPolicy: boolean;
    strictTransportSecurity: boolean;
    xContentTypeOptions: boolean;
    xDnsPrefetchControl: boolean;
    xDownloadOptions: boolean;
    xFrameOptions: boolean;
    xPermittedCrossDomainPolicies: boolean;
    xPoweredBy: boolean;
    xXssProtection: boolean;
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    originAgentCluster: true,
    referrerPolicy: true,
    strictTransportSecurity: true,
    xContentTypeOptions: true,
    xDnsPrefetchControl: true,
    xDownloadOptions: true,
    xFrameOptions: true,
    xPermittedCrossDomainPolicies: true,
    xPoweredBy: false, // Remove X-Powered-By header
    xXssProtection: true,
};

/**
 * Generate Content Security Policy directive
 */
export const generateCSP = (options?: {
    allowInlineStyles?: boolean;
    allowInlineScripts?: boolean;
    allowEval?: boolean;
    additionalDomains?: string[];
}): string => {
    const {
        allowInlineStyles = false,
        allowInlineScripts = false,
        allowEval = false,
        additionalDomains = []
    } = options || {};

    const basePolicy = {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            "'unsafe-inline'", // Required for Material-UI and React
            "'unsafe-eval'", // Required for development
            'https://maps.googleapis.com',
            'https://maps.gstatic.com',
            ...additionalDomains
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'", // Required for Material-UI
            'https://fonts.googleapis.com',
            ...additionalDomains
        ],
        'img-src': [
            "'self'",
            'data:', // For base64 images
            'blob:', // For generated images
            'https:', // Allow all HTTPS images
            ...additionalDomains
        ],
        'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
            'data:', // For embedded fonts
            ...additionalDomains
        ],
        'connect-src': [
            "'self'",
            'https://*.supabase.co',
            'https://maps.googleapis.com',
            'wss:', // WebSocket connections
            ...additionalDomains
        ],
        'media-src': ["'self'", 'data:', 'blob:', ...additionalDomains],
        'object-src': ["'none'"],
        'child-src': ["'self'", ...additionalDomains],
        'frame-src': ["'self'", 'https://maps.google.com', ...additionalDomains],
        'worker-src': ["'self'", 'blob:', ...additionalDomains],
        'manifest-src': ["'self'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"], // Prevent embedding in frames
        'upgrade-insecure-requests': []
    };

    // Adjust policy based on options
    if (!allowInlineStyles) {
        basePolicy['style-src'] = basePolicy['style-src'].filter(src => src !== "'unsafe-inline'");
    }

    if (!allowInlineScripts) {
        basePolicy['script-src'] = basePolicy['script-src'].filter(src => src !== "'unsafe-inline'");
    }

    if (!allowEval) {
        basePolicy['script-src'] = basePolicy['script-src'].filter(src => src !== "'unsafe-eval'");
    }

    // Convert to CSP string
    const cspString = Object.entries(basePolicy)
        .map(([directive, sources]) => {
            if (sources.length === 0) {
                return directive;
            }
            return `${directive} ${sources.join(' ')}`;
        })
        .join('; ');

    return cspString;
};

/**
 * Generate all security headers
 */
export const generateSecurityHeaders = (
    config: Partial<SecurityHeadersConfig> = {},
    cspOptions?: Parameters<typeof generateCSP>[0]
): Record<string, string> => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const headers: Record<string, string> = {};

    // Content Security Policy
    if (finalConfig.contentSecurityPolicy) {
        headers['Content-Security-Policy'] = generateCSP(cspOptions);
    }

    // Cross-Origin Embedder Policy
    if (finalConfig.crossOriginEmbedderPolicy) {
        headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    }

    // Cross-Origin Opener Policy
    if (finalConfig.crossOriginOpenerPolicy) {
        headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    }

    // Cross-Origin Resource Policy
    if (finalConfig.crossOriginResourcePolicy) {
        headers['Cross-Origin-Resource-Policy'] = 'same-origin';
    }

    // Origin Agent Cluster
    if (finalConfig.originAgentCluster) {
        headers['Origin-Agent-Cluster'] = '?1';
    }

    // Referrer Policy
    if (finalConfig.referrerPolicy) {
        headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    // Strict Transport Security (HSTS)
    if (finalConfig.strictTransportSecurity) {
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    // X-Content-Type-Options
    if (finalConfig.xContentTypeOptions) {
        headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-DNS-Prefetch-Control
    if (finalConfig.xDnsPrefetchControl) {
        headers['X-DNS-Prefetch-Control'] = 'off';
    }

    // X-Download-Options
    if (finalConfig.xDownloadOptions) {
        headers['X-Download-Options'] = 'noopen';
    }

    // X-Frame-Options
    if (finalConfig.xFrameOptions) {
        headers['X-Frame-Options'] = 'DENY';
    }

    // X-Permitted-Cross-Domain-Policies
    if (finalConfig.xPermittedCrossDomainPolicies) {
        headers['X-Permitted-Cross-Domain-Policies'] = 'none';
    }

    // Remove X-Powered-By
    if (!finalConfig.xPoweredBy) {
        headers['X-Powered-By'] = 'remove';
    }

    // X-XSS-Protection (legacy but still useful)
    if (finalConfig.xXssProtection) {
        headers['X-XSS-Protection'] = '1; mode=block';
    }

    return headers;
};

/**
 * Apply security headers to fetch requests
 */
export const applySecurityHeaders = (
    init?: RequestInit,
    customHeaders?: Record<string, string>
): RequestInit => {
    const securityHeaders = generateSecurityHeaders();
    
    return {
        ...init,
        headers: {
            ...securityHeaders,
            ...customHeaders,
            ...init?.headers,
        },
    };
};

/**
 * Security headers middleware for Express-like frameworks
 */
export const securityHeadersMiddleware = (config?: Partial<SecurityHeadersConfig>) => {
    const headers = generateSecurityHeaders(config);
    
    return (req: any, res: any, next: any) => {
        Object.entries(headers).forEach(([name, value]) => {
            if (value === 'remove') {
                res.removeHeader(name);
            } else {
                res.setHeader(name, value);
            }
        });
        
        if (next) next();
    };
};

/**
 * Check if current environment requires strict security
 */
export const isProductionEnvironment = (): boolean => {
    return process.env.NODE_ENV === 'production' || 
           window.location.protocol === 'https:' ||
           window.location.hostname !== 'localhost';
};

/**
 * Get environment-specific security configuration
 */
export const getEnvironmentSecurityConfig = (): Partial<SecurityHeadersConfig> => {
    const isProduction = isProductionEnvironment();
    
    if (isProduction) {
        // Strict security for production
        return {
            contentSecurityPolicy: true,
            crossOriginEmbedderPolicy: true,
            crossOriginOpenerPolicy: true,
            crossOriginResourcePolicy: true,
            strictTransportSecurity: true,
            xFrameOptions: true,
        };
    } else {
        // Relaxed security for development
        return {
            contentSecurityPolicy: false, // Disable CSP in development
            crossOriginEmbedderPolicy: false,
            crossOriginOpenerPolicy: false,
            strictTransportSecurity: false,
        };
    }
};

/**
 * Validate security headers implementation
 */
export const validateSecurityHeaders = async (url: string): Promise<{
    implemented: string[];
    missing: string[];
    recommendations: string[];
}> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const headers = response.headers;
        
        const requiredHeaders = [
            'Content-Security-Policy',
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Referrer-Policy'
        ];
        
        const recommendedHeaders = [
            'Strict-Transport-Security',
            'Cross-Origin-Opener-Policy',
            'Cross-Origin-Resource-Policy'
        ];
        
        const implemented = requiredHeaders.filter(header => headers.has(header));
        const missing = requiredHeaders.filter(header => !headers.has(header));
        
        const recommendations: string[] = [];
        
        if (!headers.has('Strict-Transport-Security') && url.startsWith('https:')) {
            recommendations.push('Implement HSTS for HTTPS sites');
        }
        
        if (!headers.has('Content-Security-Policy')) {
            recommendations.push('Implement Content Security Policy to prevent XSS attacks');
        }
        
        if (headers.get('X-Frame-Options') !== 'DENY' && headers.get('X-Frame-Options') !== 'SAMEORIGIN') {
            recommendations.push('Set X-Frame-Options to DENY or SAMEORIGIN');
        }
        
        return { implemented, missing, recommendations };
    } catch (error) {
        return {
            implemented: [],
            missing: [],
            recommendations: ['Could not validate headers - ensure URL is accessible']
        };
    }
};

export default {
    generateCSP,
    generateSecurityHeaders,
    applySecurityHeaders,
    securityHeadersMiddleware,
    isProductionEnvironment,
    getEnvironmentSecurityConfig,
    validateSecurityHeaders
};