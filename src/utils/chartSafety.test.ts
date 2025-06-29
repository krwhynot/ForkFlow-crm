import { describe, it, expect } from 'vitest';
import {
    safeDivide,
    safeAmount,
    safePercentage,
    safeTrend,
    isValidChartValue,
    sanitizeChartData,
    validateChartData,
    safeRange,
    safeCurrencyFormat,
} from './chartSafety';

describe('Chart Safety Utilities', () => {
    describe('safeDivide', () => {
        it('should handle normal division', () => {
            expect(safeDivide(10, 2)).toBe(5);
            expect(safeDivide(100, 4)).toBe(25);
        });

        it('should handle division by zero', () => {
            expect(safeDivide(10, 0)).toBe(0);
            expect(safeDivide(0, 0)).toBe(0);
        });

        it('should handle null/undefined values', () => {
            expect(safeDivide(null, 5)).toBe(0);
            expect(safeDivide(undefined, 5)).toBe(0);
            expect(safeDivide(10, null)).toBe(0); // null denominator = 0
            expect(safeDivide(10, undefined)).toBe(0); // undefined denominator = 0
        });

        it('should handle NaN and Infinity', () => {
            expect(safeDivide(NaN, 5)).toBe(0);
            expect(safeDivide(Infinity, 5)).toBe(0);
            expect(safeDivide(10, NaN)).toBe(0); // NaN denominator = 0
        });
    });

    describe('safeAmount', () => {
        it('should handle valid numbers', () => {
            expect(safeAmount(42)).toBe(42);
            expect(safeAmount(0)).toBe(0);
            expect(safeAmount(-5)).toBe(-5);
        });

        it('should handle invalid values', () => {
            expect(safeAmount(null)).toBe(0);
            expect(safeAmount(undefined)).toBe(0);
            expect(safeAmount(NaN)).toBe(0);
            expect(safeAmount(Infinity)).toBe(0);
        });
    });

    describe('safeTrend', () => {
        it('should calculate trend correctly', () => {
            expect(safeTrend(120, 100)).toBe(20); // 20% increase
            expect(safeTrend(80, 100)).toBe(-20); // 20% decrease
        });

        it('should handle zero previous value', () => {
            expect(safeTrend(10, 0)).toBe(100); // New data
            expect(safeTrend(0, 0)).toBe(0); // No change
        });

        it('should handle null/undefined', () => {
            expect(safeTrend(null, 100)).toBe(-100);
            expect(safeTrend(100, null)).toBe(100);
        });
    });

    describe('isValidChartValue', () => {
        it('should validate numbers correctly', () => {
            expect(isValidChartValue(42)).toBe(true);
            expect(isValidChartValue(0)).toBe(true);
            expect(isValidChartValue(-5)).toBe(true);
        });

        it('should reject invalid values', () => {
            expect(isValidChartValue(NaN)).toBe(false);
            expect(isValidChartValue(Infinity)).toBe(false);
            expect(isValidChartValue(null)).toBe(false);
            expect(isValidChartValue(undefined)).toBe(false);
            expect(isValidChartValue('42')).toBe(false);
        });
    });

    describe('sanitizeChartData', () => {
        it('should sanitize numeric fields', () => {
            const data = [
                { name: 'A', value: 10, amount: null },
                { name: 'B', value: undefined, amount: 20 },
                { name: 'C', value: NaN, amount: Infinity },
            ];

            const result = sanitizeChartData(data, ['value', 'amount']);
            
            expect(result).toEqual([
                { name: 'A', value: 10, amount: 0 },
                { name: 'B', value: 0, amount: 20 },
                { name: 'C', value: 0, amount: 0 },
            ]);
        });
    });

    describe('validateChartData', () => {
        it('should filter out null/undefined items', () => {
            const data = [{ a: 1 }, null, { b: 2 }, undefined, { c: 3 }];
            const result = validateChartData(data);
            expect(result).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
        });

        it('should handle null/undefined input', () => {
            expect(validateChartData(null)).toEqual([]);
            expect(validateChartData(undefined)).toEqual([]);
        });
    });

    describe('safeRange', () => {
        it('should calculate range correctly', () => {
            const result = safeRange([1, 5, 3, 9, 2]);
            expect(result).toEqual({ min: 1, max: 9 });
        });

        it('should handle empty array', () => {
            const result = safeRange([]);
            expect(result).toEqual({ min: 0, max: 100 });
        });

        it('should handle single value', () => {
            const result = safeRange([5]);
            expect(result).toEqual({ min: 4, max: 6 });
        });

        it('should filter out invalid values', () => {
            const result = safeRange([1, NaN, 5, Infinity, 3]);
            expect(result).toEqual({ min: 1, max: 5 });
        });
    });

    describe('safeCurrencyFormat', () => {
        it('should format currency correctly', () => {
            expect(safeCurrencyFormat(1234)).toBe('$1,234');
            expect(safeCurrencyFormat(1234567)).toBe('$1M');
        });

        it('should handle invalid values', () => {
            expect(safeCurrencyFormat(null)).toBe('$0');
            expect(safeCurrencyFormat(undefined)).toBe('$0');
            expect(safeCurrencyFormat(NaN)).toBe('$0');
        });
    });
});