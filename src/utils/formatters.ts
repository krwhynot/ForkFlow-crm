/**
 * Utility functions for formatting data display
 */

/**
 * Format currency amount with proper locale and currency symbol
 */
export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date for display with proper locale
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(dateObj);
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj);
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // For international or non-standard numbers, return as-is
    return phone;
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0%';
    
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(value / 100);
};

/**
 * Format large numbers with compact notation (K, M, B)
 */
export const formatCompactNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0';
    
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    }).format(value);
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    
    if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(-diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return `${text.slice(0, maxLength)}...`;
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes || bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};