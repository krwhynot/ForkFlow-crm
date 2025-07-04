// Re-export all test helpers for easy importing

export * from './organizationHelpers';
export * from './testUtils';

// Helper function to create all helper instances
export function createTestHelpers(page: any) {
    return {
        organization:
            new (require('./organizationHelpers').OrganizationTestHelpers)(
                page
            ),
        utils: new (require('./testUtils').TestUtils)(page),
    };
}

// Common test patterns
export const testPatterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\(\d{3}\)\s\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\+?[\d\s\-\(\)]{10,}$/,
    zipCode: /^\d{5}(-\d{4})?$/,
    url: /^https?:\/\/.+/,
};

// Common selectors
export const selectors = {
    form: {
        submit: 'button[type="submit"], .ra-save-button',
        cancel: 'button:has-text("Cancel"), .ra-cancel-button',
        required: 'input[required], select[required], textarea[required]',
    },
    navigation: {
        menu: '.MuiDrawer-root, .navigation-menu',
        menuItem: '.MuiMenuItem-root, .nav-item',
        breadcrumb: '.MuiBreadcrumbs-root, .breadcrumb',
    },
    list: {
        searchInput: '.ra-search-input input, input[name="q"]',
        filterButton: '.ra-filter-button, button:has-text("Filters")',
        createButton: '.ra-create-button, button:has-text("Create")',
        row: '.MuiDataGrid-row, .ra-datagrid tbody tr',
    },
    notifications: {
        success: '.MuiAlert-success, .ra-notification-success',
        error: '.MuiAlert-error, .ra-notification-error',
        warning: '.MuiAlert-warning, .ra-notification-warning',
        info: '.MuiAlert-info, .ra-notification-info',
    },
    modal: {
        container: '.MuiModal-root, .MuiDialog-root',
        backdrop: '.MuiBackdrop-root',
        close: '.MuiIconButton-root:has(.MuiSvgIcon-root)',
    },
};
