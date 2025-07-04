import React, { Suspense } from 'react';
import { Resource } from 'react-admin';
import { createLazyResource } from '../common/LazyLoadingUtils';
import { LoadingFallback, SkeletonFallback } from '../common/LoadingComponent';

// Create lazy resource objects that can be imported dynamically
export const createLazyResourceObject = (
    moduleLoader: () => Promise<any>,
    fallback: React.ReactElement
) => {
    return {
        list: React.lazy(() =>
            moduleLoader().then(module => ({ default: module.default.list }))
        ),
        create: React.lazy(() =>
            moduleLoader().then(module => ({ default: module.default.create }))
        ),
        edit: React.lazy(() =>
            moduleLoader().then(module => ({ default: module.default.edit }))
        ),
        show: React.lazy(() =>
            moduleLoader().then(module => ({ default: module.default.show }))
        ),
    };
};

// Create lazy resource objects
export const LazyOrganizations = createLazyResourceObject(
    () => import('../organizations'),
    <SkeletonFallback />
);

export const LazyProducts = createLazyResourceObject(
    () => import('../products'),
    <SkeletonFallback />
);

export const LazyOpportunities = createLazyResourceObject(
    () => import('../opportunities'),
    <SkeletonFallback />
);

export const LazyInteractions = createLazyResourceObject(
    () => import('../interactions'),
    <SkeletonFallback />
);

export const LazyCompanies = createLazyResourceObject(
    () => import('../companies'),
    <SkeletonFallback />
);

export const LazySettings = createLazyResourceObject(
    () => import('../settings'),
    <LoadingFallback message="Loading settings..." />
);

// Lazy load dashboard with high priority (likely to be accessed first)
export const LazyDashboard = React.lazy(() =>
    import('../dashboard/FoodServiceDashboard').then(module => ({
        default: module.FoodServiceDashboard,
    }))
);

// Lazy load contact components (medium priority)
export const LazyContactList = React.lazy(() =>
    import('../contacts').then(module => ({
        default: module.ContactList,
    }))
);

export const LazyContactCreate = React.lazy(() =>
    import('../contacts').then(module => ({
        default: module.ContactCreate,
    }))
);

export const LazyContactEdit = React.lazy(() =>
    import('../contacts').then(module => ({
        default: module.ContactEdit,
    }))
);

export const LazyContactShow = React.lazy(() =>
    import('../contacts').then(module => ({
        default: module.ContactShow,
    }))
);

// Lazy load lighter resources (lower priority)
export const LazyCustomerList = React.lazy(() =>
    import('../customers').then(module => ({
        default: module.CustomerList,
    }))
);

export const LazyVisitList = React.lazy(() =>
    import('../visits').then(module => ({
        default: module.VisitList,
    }))
);

export const LazyVisitCreate = React.lazy(() =>
    import('../visits').then(module => ({
        default: module.VisitCreate,
    }))
);

export const LazyVisitShow = React.lazy(() =>
    import('../visits').then(module => ({
        default: module.VisitShow,
    }))
);

export const LazyReminderList = React.lazy(() =>
    import('../reminders').then(module => ({
        default: module.ReminderList,
    }))
);

export const LazyReminderCreate = React.lazy(() =>
    import('../reminders').then(module => ({
        default: module.ReminderCreate,
    }))
);

export const LazyReminderShow = React.lazy(() =>
    import('../reminders').then(module => ({
        default: module.ReminderShow,
    }))
);

// Higher-order component for wrapping components with Suspense
export const withSuspense = <P extends object>(
    Component: React.ComponentType<P>,
    fallback: React.ReactElement = <LoadingFallback />
) => {
    const WrappedComponent = (props: P) => (
        <Suspense fallback={fallback}>
            <Component {...props} />
        </Suspense>
    );

    WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
    return WrappedComponent;
};

// Preload critical resources after initial load
export const preloadCriticalResources = () => {
    // Preload dashboard and most commonly used resources
    setTimeout(() => {
        import('../dashboard/FoodServiceDashboard');
        import('../contacts');
    }, 1000);

    // Preload other resources with lower priority
    setTimeout(() => {
        import('../organizations');
        import('../products');
    }, 3000);
};

export default {
    LazyOrganizations,
    LazyProducts,
    LazyOpportunities,
    LazyInteractions,
    LazyCompanies,
    LazyDashboard,
    LazyContactList,
    LazyContactCreate,
    LazyContactEdit,
    LazyContactShow,
    LazyCustomerList,
    LazyVisitList,
    LazyVisitCreate,
    LazyVisitShow,
    LazyReminderList,
    LazyReminderCreate,
    LazyReminderShow,
    LazySettings,
    withSuspense,
    preloadCriticalResources,
};
