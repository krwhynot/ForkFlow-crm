/**
 * SessionTimeoutRoute Component
 *
 * A route wrapper that renders SessionTimeout as a persistent overlay
 * across all pages within the React Router context.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { SessionTimeout } from './SessionTimeout';

interface SessionTimeoutRouteProps {
    timeoutMinutes?: number;
    warningMinutes?: number;
    enabled?: boolean;
}

/**
 * SessionTimeoutRoute renders SessionTimeout as a persistent overlay
 * that appears on all pages within the application.
 *
 * This component is designed to be used within React-Admin's CustomRoutes
 * to ensure SessionTimeout has access to Router context while remaining
 * visible across all application pages.
 *
 * Uses React Portal to render outside the normal component tree
 * but maintains Router context access.
 */
export const SessionTimeoutRoute: React.FC<SessionTimeoutRouteProps> = ({
    timeoutMinutes = 30,
    warningMinutes = 5,
    enabled = true,
}) => {
    // Only render if enabled
    if (!enabled) {
        return null;
    }

    // Use createPortal to render SessionTimeout at document body level
    // This ensures it appears as an overlay on all pages
    return createPortal(
        <SessionTimeout
            timeoutMinutes={timeoutMinutes}
            warningMinutes={warningMinutes}
            enabled={enabled}
        />,
        document.body
    );
};

export default SessionTimeoutRoute;
