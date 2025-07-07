/**
 * Components Index - Main Entry Point
 * Re-exports all components organized by architecture
 */

// Core UI Components (reusable, generic)
export * from './core';

// Feature-Specific Components (app-specific functionality)
export * from './features';

// Business Domain Components (domain logic)
export * from './business';

// UI Kit (comprehensive component library)
export * from './ui-kit';

// Note: ErrorBoundary and Tooltip are now part of core components
// and will be exported via the core module above