import type { ImageReference } from '../models/koms'

export interface ImageUploadInput {
  file: File
  ownerType: 'student' | 'dojo' | 'event' | 'gallery' | 'branding'
  ownerId: string
  alt: string
}

/**
 * Storage boundary for future Neon-backed image metadata.
 * Upload bytes through a secure server endpoint or object store; keep only
 * references/metadata in Neon where practical. Never expose Neon credentials
 * in this browser service.
 */
export interface ImageStorageService {
  upload(input: ImageUploadInput): Promise<ImageReference>
  remove(imageId: string): Promise<void>
}

export const imageStorage: ImageStorageService = {
  async upload() {
    throw new Error('Image storage is not connected. Implement this method against your secure backend.')
  },
  async remove() {
    throw new Error('Image storage is not connected. Implement this method against your secure backend.')
  },
}
