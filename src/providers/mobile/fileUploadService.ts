export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResult {
    success: boolean;
    fileName?: string;
    url?: string;
    error?: string;
}

export interface UploadOptions {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    compression?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-1 for image compression
}

/**
 * Mobile-optimized file upload service for interaction attachments
 * Handles file validation, compression, and chunked uploads
 */
export class FileUploadService {
    private static instance: FileUploadService;
    private uploadQueue: Map<string, AbortController> = new Map();

    // Default configuration optimized for mobile
    private readonly DEFAULT_OPTIONS: UploadOptions = {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'text/csv',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        compression: true,
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
    };

    private constructor() {}

    static getInstance(): FileUploadService {
        if (!FileUploadService.instance) {
            FileUploadService.instance = new FileUploadService();
        }
        return FileUploadService.instance;
    }

    /**
     * Validate file before upload
     */
    validateFile(file: File, options?: UploadOptions): { valid: boolean; error?: string } {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };

        // Check file size
        if (file.size > opts.maxSize!) {
            return {
                valid: false,
                error: `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(opts.maxSize!)})`,
            };
        }

        // Check file type
        if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type ${file.type} is not allowed. Allowed types: ${opts.allowedTypes.join(', ')}`,
            };
        }

        // Check if file name is reasonable
        if (!file.name || file.name.length > 255) {
            return {
                valid: false,
                error: 'File name is invalid or too long',
            };
        }

        return { valid: true };
    }

    /**
     * Process and upload file with mobile optimizations
     */
    async uploadFile(
        file: File,
        uploadEndpoint: string,
        options?: UploadOptions,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResult> {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Validate file
        const validation = this.validateFile(file, opts);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            };
        }

        try {
            // Process file (compress if needed)
            const processedFile = await this.processFile(file, opts);

            // Create abort controller for this upload
            const abortController = new AbortController();
            this.uploadQueue.set(uploadId, abortController);

            const result = await this.performUpload(
                processedFile,
                uploadEndpoint,
                uploadId,
                abortController.signal,
                onProgress
            );

            // Clean up
            this.uploadQueue.delete(uploadId);

            return result;
        } catch (error: any) {
            this.uploadQueue.delete(uploadId);
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Upload was cancelled',
                };
            }

            return {
                success: false,
                error: error.message || 'Upload failed',
            };
        }
    }

    /**
     * Cancel an ongoing upload
     */
    cancelUpload(uploadId: string): boolean {
        const controller = this.uploadQueue.get(uploadId);
        if (controller) {
            controller.abort();
            this.uploadQueue.delete(uploadId);
            return true;
        }
        return false;
    }

    /**
     * Cancel all ongoing uploads
     */
    cancelAllUploads(): void {
        this.uploadQueue.forEach((controller) => {
            controller.abort();
        });
        this.uploadQueue.clear();
    }

    /**
     * Compress image file for mobile upload
     */
    async compressImage(
        file: File,
        maxWidth: number = 1920,
        maxHeight: number = 1080,
        quality: number = 0.8
    ): Promise<File> {
        if (!file.type.startsWith('image/')) {
            return file;
        }

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = this.calculateDimensions(
                    img.width,
                    img.height,
                    maxWidth,
                    maxHeight
                );

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx!.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Image compression failed'));
                        }
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Create thumbnail for image files
     */
    async createThumbnail(
        file: File,
        size: number = 150
    ): Promise<{ thumbnail: File; dataUrl: string } | null> {
        if (!file.type.startsWith('image/')) {
            return null;
        }

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Make square thumbnail
                canvas.width = size;
                canvas.height = size;

                // Calculate crop dimensions for square aspect ratio
                const minDimension = Math.min(img.width, img.height);
                const cropX = (img.width - minDimension) / 2;
                const cropY = (img.height - minDimension) / 2;

                // Draw cropped and scaled image
                ctx!.drawImage(
                    img,
                    cropX, cropY, minDimension, minDimension,
                    0, 0, size, size
                );

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve({
                                thumbnail: thumbnailFile,
                                dataUrl,
                            });
                        } else {
                            reject(new Error('Thumbnail creation failed'));
                        }
                    },
                    'image/jpeg',
                    0.7
                );
            };

            img.onerror = () => reject(new Error('Failed to load image for thumbnail'));

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get file type icon class for display
     */
    getFileTypeIcon(file: File): string {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type === 'application/pdf') return 'pdf';
        if (file.type.includes('word')) return 'document';
        if (file.type.includes('text')) return 'text';
        return 'file';
    }

    private async processFile(file: File, options: UploadOptions): Promise<File> {
        // For images, apply compression if enabled
        if (file.type.startsWith('image/') && options.compression) {
            return await this.compressImage(
                file,
                options.maxWidth,
                options.maxHeight,
                options.quality
            );
        }

        return file;
    }

    private async performUpload(
        file: File,
        endpoint: string,
        uploadId: string,
        signal: AbortSignal,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadId', uploadId);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Set up progress tracking
            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress: UploadProgress = {
                            loaded: event.loaded,
                            total: event.total,
                            percentage: Math.round((event.loaded / event.total) * 100),
                        };
                        onProgress(progress);
                    }
                });
            }

            // Handle completion
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve({
                            success: true,
                            fileName: response.fileName || file.name,
                            url: response.url,
                        });
                    } catch (error) {
                        resolve({
                            success: true,
                            fileName: file.name,
                        });
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            // Handle errors
            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed due to network error'));
            });

            // Handle abort
            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was cancelled'));
            });

            // Connect abort signal
            signal.addEventListener('abort', () => {
                xhr.abort();
            });

            // Send request
            xhr.open('POST', endpoint);
            xhr.send(formData);
        });
    }

    private calculateDimensions(
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number
    ): { width: number; height: number } {
        let { width, height } = { width: originalWidth, height: originalHeight };

        // Only resize if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
                width = maxWidth;
                height = width / aspectRatio;
            } else {
                height = maxHeight;
                width = height * aspectRatio;
            }

            // Ensure we don't exceed either dimension
            if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
            }
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
        }

        return {
            width: Math.round(width),
            height: Math.round(height),
        };
    }
}

// Singleton instance for use across the application
export const fileUploadService = FileUploadService.getInstance();

// Hook for React components
export const useFileUploadService = () => {
    return fileUploadService;
};