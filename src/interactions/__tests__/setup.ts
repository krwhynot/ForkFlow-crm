import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = '0px';
    thresholds = [0];

    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() {
        return [];
    }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};

// Mock geolocation API
Object.defineProperty(navigator, 'geolocation', {
    value: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
    },
    writable: true,
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
});

// Mock online/offline status
Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true,
});

// Mock File API
global.File = class extends Blob {
    name: string;
    lastModified: number;
    webkitRelativePath: string = '';

    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
        super(bits, options);
        this.name = name;
        this.lastModified = options?.lastModified || Date.now();
    }
} as any;

// Mock FileReader
global.FileReader = class {
    static readonly EMPTY = 0;
    static readonly LOADING = 1;
    static readonly DONE = 2;

    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;
    readyState: number = 0;

    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
        null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
        null;
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
        null;
    onloadend:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
        | null = null;
    onloadstart:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
        | null = null;
    onprogress:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
        | null = null;

    readAsArrayBuffer(file: Blob) {}
    readAsBinaryString(file: Blob) {}
    abort() {}

    readAsDataURL(file: Blob) {
        const self = this as any;
        self.readyState = 1;
        setTimeout(() => {
            self.result =
                'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A/9k=';
            self.readyState = 2;
            if (self.onload) {
                self.onload({} as ProgressEvent<FileReader>);
            }
            if (self.onloadend) {
                self.onloadend({} as ProgressEvent<FileReader>);
            }
        }, 10);
    }

    readAsText(file: Blob) {
        const self = this as any;
        self.readyState = 1;
        setTimeout(() => {
            self.result = 'Mock file content';
            self.readyState = 2;
            if (self.onload) {
                self.onload({} as ProgressEvent<FileReader>);
            }
            if (self.onloadend) {
                self.onloadend({} as ProgressEvent<FileReader>);
            }
        }, 10);
    }

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
        return true;
    }
} as any;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
});

// Clean up after each test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
    });
});

// Restore console after all tests
afterAll(() => {
    Object.assign(console, originalConsole);
});

// Global test utilities
export const mockGeolocationSuccess = (coords: GeolocationCoordinates) => {
    (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: PositionCallback) => {
            success({
                coords,
                timestamp: Date.now(),
            } as GeolocationPosition);
        }
    );
};

export const mockGeolocationError = (code: number, message: string) => {
    (navigator.geolocation.getCurrentPosition as any).mockImplementation(
        (success: PositionCallback, error: PositionErrorCallback) => {
            error({
                code,
                message,
            } as GeolocationPositionError);
        }
    );
};

export const mockOfflineMode = () => {
    Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
    });
};

export const mockOnlineMode = () => {
    Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
    });
};

export const createMockFile = (
    name: string,
    type: string,
    size: number = 1024
) => {
    const file = new File(['x'.repeat(size)], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
};

export const mockLocalStorage = (data: Record<string, string> = {}) => {
    const storage: Record<string, string> = { ...data };

    (localStorage.getItem as any).mockImplementation(
        (key: string) => storage[key] || null
    );
    (localStorage.setItem as any).mockImplementation(
        (key: string, value: string) => {
            storage[key] = value;
        }
    );
    (localStorage.removeItem as any).mockImplementation((key: string) => {
        delete storage[key];
    });
    (localStorage.clear as any).mockImplementation(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
    });

    return storage;
};

// Common test data factories
export const createMockInteraction = (overrides: any = {}) => ({
    id: 'test-interaction-1',
    subject: 'Test Interaction',
    description: 'Test interaction description',
    organizationId: 'org-1',
    contactId: 'contact-1',
    typeId: 'type-1',
    scheduledDate: new Date().toISOString(),
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

export const createMockOrganization = (overrides: any = {}) => ({
    id: 'org-1',
    name: 'Test Organization',
    type: 'customer',
    ...overrides,
});

export const createMockContact = (overrides: any = {}) => ({
    id: 'contact-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    organizationId: 'org-1',
    ...overrides,
});

export const createMockInteractionType = (overrides: any = {}) => ({
    id: 'type-1',
    category: 'interaction_type',
    key: 'in_person',
    label: 'In Person',
    sortOrder: 1,
    ...overrides,
});

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
        result,
        duration: end - start,
    };
};

export const waitForCondition = async (
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
) => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    if (!condition()) {
        throw new Error(`Condition not met within ${timeout}ms`);
    }
};
