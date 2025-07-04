// Mobile services for ForkFlow-CRM interaction tracking

export { GPSService, gpsService, useGPSService } from './gpsService';
export {
    OfflineService,
    offlineService,
    useOfflineService,
} from './offlineService';
export {
    FileUploadService,
    fileUploadService,
    useFileUploadService,
} from './fileUploadService';

export type {
    GPSCoordinates,
    GPSLocationResult,
    GPSOptions,
} from './gpsService';

export type {
    OfflineAction,
    OfflineStatus,
    SyncResult,
} from './offlineService';

export type {
    UploadProgress,
    UploadResult,
    UploadOptions,
} from './fileUploadService';
