import React, { createContext, useContext, useEffect, useState } from 'react';
import { GPSCoordinates, LocationPermission } from '../../types';

interface LocationContextType {
    currentLocation: GPSCoordinates | null;
    permission: LocationPermission;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<GPSCoordinates | null>;
    watchPosition: boolean;
    setWatchPosition: (watch: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
    undefined
);

interface LocationProviderProps {
    children: React.ReactNode;
    autoRequest?: boolean;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
    children,
    autoRequest = false,
}) => {
    const [currentLocation, setCurrentLocation] =
        useState<GPSCoordinates | null>(null);
    const [permission, setPermission] = useState<LocationPermission>('prompt');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [watchPosition, setWatchPosition] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);

    const requestLocation = async (): Promise<GPSCoordinates | null> => {
        if (!navigator.geolocation) {
            const err = 'Geolocation is not supported by this browser';
            setError(err);
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const position = await new Promise<GeolocationPosition>(
                (resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000, // Cache for 1 minute
                    });
                }
            );

            const coordinates: GPSCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString(),
            };

            setCurrentLocation(coordinates);
            setPermission('granted');
            return coordinates;
        } catch (err: any) {
            const errorMessage = `Geolocation error: ${err.message}`;
            setError(errorMessage);
            setPermission('denied');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Watch position for continuous tracking
    useEffect(() => {
        if (!watchPosition || !navigator.geolocation) {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
            }
            return;
        }

        const id = navigator.geolocation.watchPosition(
            position => {
                const coordinates: GPSCoordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString(),
                };
                setCurrentLocation(coordinates);
                setPermission('granted');
            },
            err => {
                setError(`Watch position error: ${err.message}`);
                setPermission('denied');
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000,
            }
        );

        setWatchId(id);

        return () => {
            navigator.geolocation.clearWatch(id);
        };
    }, [watchPosition, watchId]);

    // Auto-request location on mount if specified
    useEffect(() => {
        if (autoRequest) {
            requestLocation();
        }
    }, [autoRequest]);

    const value: LocationContextType = {
        currentLocation,
        permission,
        isLoading,
        error,
        requestLocation,
        watchPosition,
        setWatchPosition,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = (): LocationContextType => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

// Hook for components that need location on demand
export const useLocationOnDemand = () => {
    const { requestLocation, currentLocation, isLoading, error } =
        useLocation();

    return {
        getLocation: requestLocation,
        currentLocation,
        isLoading,
        error,
    };
};
