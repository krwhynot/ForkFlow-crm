// src/utils/securityValidation.ts

/**
 * Security validation utilities for input sanitization and validation
 */

// Common security patterns
const SECURITY_PATTERNS = {
    // SQL injection patterns
    SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(['"]+.*['"]+)/gi,
    
    // XSS patterns
    XSS_SCRIPT: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    XSS_ONERROR: /on\w+\s*=/gi,
    XSS_JAVASCRIPT: /javascript:/gi,
    
    // Path traversal
    PATH_TRAVERSAL: /\.\.[\/\\]/g,
    
    // Command injection
    COMMAND_INJECTION: /[;&|`$(){}[\]]/g,
    
    // Email validation (RFC 5322 compliant)
    EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    
    // Phone number validation (E.164 format)
    PHONE: /^\+?[1-9]\d{1,14}$/,
    
    // URL validation
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    
    // Strong password requirements
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    
    // Safe filename
    SAFE_FILENAME: /^[a-zA-Z0-9._-]+$/,
    
    // Alphanumeric with basic symbols
    ALPHANUMERIC_SAFE: /^[a-zA-Z0-9\s\-_.@]+$/,
    
    // IP address validation
    IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
};

// Security risk levels
export enum SecurityRiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// Validation result interface
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    riskLevel: SecurityRiskLevel;
    sanitized?: string;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
    if (!input) return '';
    
    return input
        .replace(SECURITY_PATTERNS.XSS_SCRIPT, '')
        .replace(SECURITY_PATTERNS.XSS_ONERROR, '')
        .replace(SECURITY_PATTERNS.XSS_JAVASCRIPT, '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize SQL input to prevent injection attacks
 */
export const sanitizeSql = (input: string): string => {
    if (!input) return '';
    
    return input
        .replace(/'/g, "''")  // Escape single quotes
        .replace(/"/g, '""')  // Escape double quotes
        .replace(/\\/g, '\\\\')  // Escape backslashes
        .replace(/\x00/g, '\\0')  // Escape null bytes
        .replace(/\x1a/g, '\\Z');  // Escape Control+Z
};

/**
 * Validate and sanitize general text input
 */
export const validateTextInput = (
    input: string, 
    options: {
        maxLength?: number;
        minLength?: number;
        allowHtml?: boolean;
        allowSpecialChars?: boolean;
        required?: boolean;
    } = {}
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = SecurityRiskLevel.LOW;
    
    // Check if required
    if (options.required && (!input || input.trim().length === 0)) {
        errors.push('This field is required');
        return { isValid: false, errors, warnings, riskLevel };
    }
    
    if (!input) {
        return { isValid: true, errors, warnings, riskLevel, sanitized: '' };
    }
    
    // Length validation
    if (options.maxLength && input.length > options.maxLength) {
        errors.push(`Text must be ${options.maxLength} characters or less`);
    }
    
    if (options.minLength && input.length < options.minLength) {
        errors.push(`Text must be at least ${options.minLength} characters`);
    }
    
    // Check for potential security issues
    if (SECURITY_PATTERNS.SQL_INJECTION.test(input)) {
        errors.push('Input contains potentially dangerous SQL patterns');
        riskLevel = SecurityRiskLevel.HIGH;
    }
    
    if (!options.allowHtml && (SECURITY_PATTERNS.XSS_SCRIPT.test(input) || SECURITY_PATTERNS.XSS_ONERROR.test(input))) {
        errors.push('Input contains potentially dangerous script content');
        riskLevel = SecurityRiskLevel.CRITICAL;
    }
    
    if (SECURITY_PATTERNS.PATH_TRAVERSAL.test(input)) {
        errors.push('Input contains path traversal patterns');
        riskLevel = SecurityRiskLevel.HIGH;
    }
    
    if (SECURITY_PATTERNS.COMMAND_INJECTION.test(input) && !options.allowSpecialChars) {
        warnings.push('Input contains special characters that may be unsafe');
        riskLevel = SecurityRiskLevel.MEDIUM;
    }
    
    // Sanitize the input
    let sanitized = input;
    if (!options.allowHtml) {
        sanitized = sanitizeHtml(sanitized);
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel,
        sanitized
    };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string, required: boolean = false): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = SecurityRiskLevel.LOW;
    
    if (required && !email) {
        errors.push('Email address is required');
        return { isValid: false, errors, warnings, riskLevel };
    }
    
    if (!email) {
        return { isValid: true, errors, warnings, riskLevel };
    }
    
    // Basic email validation
    if (!SECURITY_PATTERNS.EMAIL.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Check for suspicious patterns
    if (email.length > 254) {
        errors.push('Email address is too long');
    }
    
    // Check for common attack patterns
    if (email.includes('..') || email.includes('@@')) {
        errors.push('Email address contains invalid patterns');
        riskLevel = SecurityRiskLevel.MEDIUM;
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel,
        sanitized: email.toLowerCase().trim()
    };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string, required: boolean = false): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = SecurityRiskLevel.LOW;
    
    if (required && !phone) {
        errors.push('Phone number is required');
        return { isValid: false, errors, warnings, riskLevel };
    }
    
    if (!phone) {
        return { isValid: true, errors, warnings, riskLevel };
    }
    
    // Remove common formatting characters
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Validate E.164 format
    if (!SECURITY_PATTERNS.PHONE.test(cleanPhone)) {
        errors.push('Please enter a valid phone number in international format (e.g., +1234567890)');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel,
        sanitized: cleanPhone
    };
};

/**
 * Validate URL
 */
export const validateUrl = (url: string, required: boolean = false): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = SecurityRiskLevel.LOW;
    
    if (required && !url) {
        errors.push('URL is required');
        return { isValid: false, errors, warnings, riskLevel };
    }
    
    if (!url) {
        return { isValid: true, errors, warnings, riskLevel };
    }
    
    // Add protocol if missing
    let cleanUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        cleanUrl = 'https://' + url;
    }
    
    // Validate URL format
    if (!SECURITY_PATTERNS.URL.test(cleanUrl)) {
        errors.push('Please enter a valid URL');
    }
    
    // Security checks
    if (url.includes('javascript:') || url.includes('data:')) {
        errors.push('URL contains potentially dangerous protocol');
        riskLevel = SecurityRiskLevel.HIGH;
    }
    
    // Warn about HTTP (non-secure) URLs
    if (cleanUrl.startsWith('http://')) {
        warnings.push('Consider using HTTPS for better security');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel,
        sanitized: cleanUrl
    };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string, requirements?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
    maxLength?: number;
}): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = SecurityRiskLevel.LOW;
    
    const config = {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        maxLength: 128,
        ...requirements
    };
    
    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors, warnings, riskLevel };
    }
    
    // Length checks
    if (password.length < config.minLength) {
        errors.push(`Password must be at least ${config.minLength} characters long`);
    }
    
    if (password.length > config.maxLength) {
        errors.push(`Password must be ${config.maxLength} characters or less`);
    }
    
    // Character requirement checks
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (config.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (config.requireSymbols && !/[@$!%*?&]/.test(password)) {
        errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    // Common password checks
    const commonPasswords = [
        'password', 'password123', '123456', 'qwerty', 'abc123',
        'admin', 'administrator', 'root', 'user', 'guest'
    ];
    
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        errors.push('Password contains common words or patterns');
        riskLevel = SecurityRiskLevel.MEDIUM;
    }
    
    // Sequential characters check
    if (/123|abc|qwe/i.test(password)) {
        warnings.push('Avoid using sequential characters in passwords');
    }
    
    // Repeated characters check
    if (/(.)\1{2,}/.test(password)) {
        warnings.push('Avoid repeating the same character multiple times');
    }
    
    // Calculate strength score
    let strengthScore = 0;
    if (password.length >= config.minLength) strengthScore += 25;
    if (/[A-Z]/.test(password)) strengthScore += 20;
    if (/[a-z]/.test(password)) strengthScore += 20;
    if (/\d/.test(password)) strengthScore += 15;
    if (/[@$!%*?&]/.test(password)) strengthScore += 20;
    
    if (strengthScore < 60) {
        riskLevel = SecurityRiskLevel.HIGH;
    } else if (strengthScore < 80) {
        riskLevel = SecurityRiskLevel.MEDIUM;
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel
    };
};

/**
 * Validate filename for uploads
 */
export const validateFilename = (filename: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = SecurityRiskLevel.LOW;
    
    if (!filename) {
        errors.push('Filename is required');
        return { isValid: false, errors, warnings, riskLevel };
    }
    
    // Check for path traversal
    if (SECURITY_PATTERNS.PATH_TRAVERSAL.test(filename)) {
        errors.push('Filename contains path traversal characters');
        riskLevel = SecurityRiskLevel.HIGH;
    }
    
    // Check for executable extensions
    const dangerousExtensions = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
        '.jar', '.php', '.asp', '.aspx', '.jsp', '.sh', '.pl', '.py'
    ];
    
    const extension = '.' + filename.split('.').pop()?.toLowerCase();
    if (dangerousExtensions.includes(extension)) {
        errors.push('File type is not allowed for security reasons');
        riskLevel = SecurityRiskLevel.CRITICAL;
    }
    
    // Check for safe characters
    if (!SECURITY_PATTERNS.SAFE_FILENAME.test(filename)) {
        errors.push('Filename contains invalid characters. Use only letters, numbers, dots, hyphens, and underscores');
    }
    
    // Length check
    if (filename.length > 255) {
        errors.push('Filename is too long (maximum 255 characters)');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel,
        sanitized: filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    };
};

/**
 * Validate IP address
 */
export const validateIpAddress = (ip: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskLevel = SecurityRiskLevel.LOW;
    
    if (!ip) {
        errors.push('IP address is required');
        return { isValid: false, errors, warnings, riskLevel };
    }
    
    if (!SECURITY_PATTERNS.IP_ADDRESS.test(ip)) {
        errors.push('Please enter a valid IPv4 address');
    }
    
    // Check for private/local addresses
    const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^127\./,
        /^169\.254\./
    ];
    
    if (privateRanges.some(range => range.test(ip))) {
        warnings.push('This appears to be a private or local IP address');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        riskLevel
    };
};

/**
 * Comprehensive input sanitization
 */
export const sanitizeInput = (input: any, type: 'text' | 'email' | 'url' | 'filename' = 'text'): string => {
    if (input === null || input === undefined) return '';
    
    let cleaned = String(input).trim();
    
    switch (type) {
        case 'email':
            return cleaned.toLowerCase();
        
        case 'url':
            if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
                cleaned = 'https://' + cleaned;
            }
            return cleaned;
        
        case 'filename':
            return cleaned.replace(/[^a-zA-Z0-9._-]/g, '_');
        
        default:
            return sanitizeHtml(cleaned);
    }
};

/**
 * Rate limiting check (simple implementation)
 */
export const checkRateLimit = (
    identifier: string, 
    maxAttempts: number = 5, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; attemptsRemaining: number; resetTime: number } => {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    
    // Get stored data
    const stored = localStorage.getItem(key);
    let data = stored ? JSON.parse(stored) : { attempts: 0, resetTime: now + windowMs };
    
    // Check if window has expired
    if (now > data.resetTime) {
        data = { attempts: 0, resetTime: now + windowMs };
    }
    
    // Check if limit exceeded
    if (data.attempts >= maxAttempts) {
        return {
            allowed: false,
            attemptsRemaining: 0,
            resetTime: data.resetTime
        };
    }
    
    // Increment attempts
    data.attempts++;
    localStorage.setItem(key, JSON.stringify(data));
    
    return {
        allowed: true,
        attemptsRemaining: maxAttempts - data.attempts,
        resetTime: data.resetTime
    };
};

/**
 * Generate secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Use crypto API if available
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            result += charset[array[i] % charset.length];
        }
    } else {
        // Fallback to Math.random (less secure)
        for (let i = 0; i < length; i++) {
            result += charset[Math.floor(Math.random() * charset.length)];
        }
    }
    
    return result;
};

export default {
    sanitizeHtml,
    sanitizeSql,
    validateTextInput,
    validateEmail,
    validatePhone,
    validateUrl,
    validatePassword,
    validateFilename,
    validateIpAddress,
    sanitizeInput,
    checkRateLimit,
    generateSecureToken,
    SecurityRiskLevel
};