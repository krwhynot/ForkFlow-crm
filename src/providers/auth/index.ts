/**
 * Authentication Providers for ForkFlow CRM
 * Exports JWT and Supabase auth providers
 */

export { jwtAuthProvider, initializeAuthentication } from './jwtAuthProvider';
export { authProvider as supabaseAuthProvider } from '../supabase/authProvider';