/**
 * Chart Safety Utilities
 *
 * Utility functions to prevent NaN values in chart rendering,
 * specifically targeting SVG attribute errors in Nivo charts.
 */

/**
 * Safely divides two numbers, returning 0 if division would result in NaN or Infinity
 */
export function safeDivide(
    numerator: number | null | undefined,
    denominator: number | null | undefined
): number {
    const num =
        typeof numerator === 'number' && isFinite(numerator) ? numerator : 0;
    const denom =
        typeof denominator === 'number' && isFinite(denominator)
            ? denominator
            : 0;

    if (denom === 0) return 0;

    const result = num / denom;
    return isFinite(result) ? result : 0;
}

/**
 * Safely converts a value to a number, returning 0 for null/undefined/NaN values
 */
export function safeAmount(amount: number | null | undefined): number {
    return typeof amount === 'number' && isFinite(amount) ? amount : 0;
}

/**
 * Safely calculates percentage, returning 0 if calculation would result in NaN
 */
export function safePercentage(
    value: number | null | undefined,
    total: number | null | undefined
): number {
    const safeValue = safeAmount(value);
    const safeTotal = safeAmount(total);

    if (safeTotal === 0) return 0;

    const percentage = (safeValue / safeTotal) * 100;
    return isFinite(percentage) ? percentage : 0;
}

/**
 * Safely calculates trend percentage between two values
 */
export function safeTrend(
    current: number | null | undefined,
    previous: number | null | undefined
): number {
    const currentValue = safeAmount(current);
    const previousValue = safeAmount(previous);

    if (previousValue === 0) {
        return currentValue > 0 ? 100 : 0;
    }

    const trend = ((currentValue - previousValue) / previousValue) * 100;
    return isFinite(trend) ? trend : 0;
}

/**
 * Validates that a number is safe for use in chart calculations
 */
export function isValidChartValue(value: any): value is number {
    return typeof value === 'number' && isFinite(value) && !isNaN(value);
}

/**
 * Sanitizes chart data by ensuring all numeric values are safe
 */
export function sanitizeChartData<T extends Record<string, any>>(
    data: T[],
    numericFields: (keyof T)[]
): T[] {
    return data.map(item => {
        const sanitized = { ...item };

        numericFields.forEach(field => {
            sanitized[field] = safeAmount(item[field] as number) as T[keyof T];
        });

        return sanitized;
    });
}

/**
 * Validates chart data array and ensures it's safe for rendering
 */
export function validateChartData<T>(data: T[] | null | undefined): T[] {
    if (!Array.isArray(data)) return [];
    return data.filter(item => item != null);
}

/**
 * Creates a safe range for chart scales, preventing NaN or invalid values
 */
export function safeRange(values: number[]): { min: number; max: number } {
    const validValues = values.filter(isValidChartValue);

    if (validValues.length === 0) {
        return { min: 0, max: 100 }; // Default safe range
    }

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    // Ensure range is valid and has some spread
    if (min === max) {
        return { min: min - 1, max: max + 1 };
    }

    return { min, max };
}

/**
 * Formats currency safely, handling null/undefined/NaN values
 */
export function safeCurrencyFormat(amount: number | null | undefined): string {
    const safeValue = safeAmount(amount);

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: safeValue >= 1000000 ? 'compact' : 'standard',
        maximumFractionDigits: 0,
    }).format(safeValue);
}

/**
 * Ensures a chart has a valid parent container size (optimized to prevent forced reflows)
 */
export function validateChartContainer(element: HTMLElement | null): boolean {
    if (!element) return false;

    // Use ResizeObserver or CSS properties to avoid forced reflow
    // First check if element has explicit size styles
    const style = window.getComputedStyle(element);
    const hasExplicitSize =
        style.width !== 'auto' &&
        style.width !== '0px' &&
        style.height !== 'auto' &&
        style.height !== '0px';

    if (hasExplicitSize) {
        return true;
    }

    // Fallback: only use getBoundingClientRect when absolutely necessary
    // and batch it with other DOM reads if possible
    try {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    } catch {
        return false;
    }
}
