import { describe, expect, it } from 'vitest'

import { decryptWithAesGcm } from './decryptWithAesGcm'
import { encryptWithAesGcm } from './encryptWithAesGcm'

describe('AES-GCM Encryption/Decryption', () => {
  describe('Legacy format (without salt)', () => {
    it('should encrypt and decrypt data with hex key', async () => {
      const key =
        'd6022efdbf1cd27b2feb179341b40a800f4fdda7cdfd91ca630f1f17ee0516f3'
      const originalData = 'Hello, World!'

      const encryptedData = await encryptWithAesGcm({
        key: Buffer.from(key, 'hex'),
        value: Buffer.from(originalData, 'utf-8'),
        useSalt: false,
      })

      const decryptedData = await decryptWithAesGcm({
        key: Buffer.from(key, 'hex'),
        value: encryptedData,
        useSalt: false,
      })

      expect(decryptedData.toString('utf-8')).toBe(originalData)
    })

    it('should decrypt existing legacy data', async () => {
      const key =
        'd6022efdbf1cd27b2feb179341b40a800f4fdda7cdfd91ca630f1f17ee0516f3'
      const data = 'lBVUUrBAYm2R6uiESzrgOaaW0GyiOuf2ki6O18YOEBFnQryTj4s='

      const decryptedData = await decryptWithAesGcm({
        key: Buffer.from(key, 'hex'),
        value: Buffer.from(data, 'base64'),
        useSalt: false,
      })

      expect(decryptedData.toString('utf-8')).toBe('helloworld')
    })

    it('should produce different outputs due to random nonce', async () => {
      const key = Buffer.from(
        'd6022efdbf1cd27b2feb179341b40a800f4fdda7cdfd91ca630f1f17ee0516f3',
        'hex'
      )
      const data = 'consistent data'

      const encrypted1 = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: false,
      })

      const encrypted2 = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: false,
      })

      // Should be different due to random nonce
      expect(encrypted1.equals(encrypted2)).toBe(false)

      // But both should decrypt to the same data
      const decrypted1 = await decryptWithAesGcm({
        key,
        value: encrypted1,
        useSalt: false,
      })

      const decrypted2 = await decryptWithAesGcm({
        key,
        value: encrypted2,
        useSalt: false,
      })

      expect(decrypted1.toString('utf-8')).toBe(data)
      expect(decrypted2.toString('utf-8')).toBe(data)
    })
  })

  describe('New format (with salt)', () => {
    it('should encrypt and decrypt data with salt', async () => {
      const key = 'mySecurePassword123'
      const originalData = 'This is sensitive data that needs encryption'

      const encryptedData = await encryptWithAesGcm({
        key,
        value: Buffer.from(originalData, 'utf-8'),
        useSalt: true,
      })

      const decryptedData = await decryptWithAesGcm({
        key,
        value: encryptedData,
        useSalt: true,
      })

      expect(decryptedData.toString('utf-8')).toBe(originalData)
    })

    it('should produce different encrypted outputs for same input', async () => {
      const key = 'samePassword'
      const data = 'same data'

      const encrypted1 = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: true,
      })

      const encrypted2 = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: true,
      })

      // Should be different due to random salt and nonce
      expect(encrypted1.equals(encrypted2)).toBe(false)

      // But both should decrypt to the same original data
      const decrypted1 = await decryptWithAesGcm({
        key,
        value: encrypted1,
        useSalt: true,
      })

      const decrypted2 = await decryptWithAesGcm({
        key,
        value: encrypted2,
        useSalt: true,
      })

      expect(decrypted1.toString('utf-8')).toBe(data)
      expect(decrypted2.toString('utf-8')).toBe(data)
    })

    it('should handle different key data types', async () => {
      const stringKey = 'myStringPassword'
      const bufferKey = Buffer.from('myStringPassword', 'utf-8')
      const data = 'test data'

      // Encrypt with string key
      const encryptedWithString = await encryptWithAesGcm({
        key: stringKey,
        value: Buffer.from(data, 'utf-8'),
        useSalt: true,
      })

      // Encrypt with buffer key
      const encryptedWithBuffer = await encryptWithAesGcm({
        key: bufferKey,
        value: Buffer.from(data, 'utf-8'),
        useSalt: true,
      })

      // Both should decrypt successfully
      const decryptedFromString = await decryptWithAesGcm({
        key: stringKey,
        value: encryptedWithString,
        useSalt: true,
      })

      const decryptedFromBuffer = await decryptWithAesGcm({
        key: bufferKey,
        value: encryptedWithBuffer,
        useSalt: true,
      })

      expect(decryptedFromString.toString('utf-8')).toBe(data)
      expect(decryptedFromBuffer.toString('utf-8')).toBe(data)
    })
  })

  describe('Format differences', () => {
    it('should create different buffer lengths for salt vs non-salt formats', async () => {
      const key = 'testPassword'
      const data = 'test data'

      const encryptedWithoutSalt = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: false,
      })

      const encryptedWithSalt = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: true,
      })

      // Salt format should be 16 bytes longer (salt size)
      expect(encryptedWithSalt.length).toBe(encryptedWithoutSalt.length + 16)
    })

    it('should default to legacy format when useSalt is not specified', async () => {
      const key = 'testPassword'
      const data = 'test data'

      const encryptedDefault = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: false,
      })

      const encryptedExplicitFalse = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: false,
      })

      // Both should decrypt with useSalt: false
      const decryptedDefault = await decryptWithAesGcm({
        key,
        value: encryptedDefault,
        useSalt: false,
      })

      const decryptedExplicitFalse = await decryptWithAesGcm({
        key,
        value: encryptedExplicitFalse,
        useSalt: false,
      })

      expect(decryptedDefault.toString('utf-8')).toBe(data)
      expect(decryptedExplicitFalse.toString('utf-8')).toBe(data)
    })
  })

  describe('Error handling', () => {
    it('should throw error when decrypting with wrong password (salt format)', async () => {
      const correctKey = 'correctPassword'
      const wrongKey = 'wrongPassword'
      const data = 'secret data'

      const encryptedData = await encryptWithAesGcm({
        key: correctKey,
        value: Buffer.from(data, 'utf-8'),
        useSalt: true,
      })

      await expect(async () => {
        await decryptWithAesGcm({
          key: wrongKey,
          value: encryptedData,
          useSalt: true,
        })
      }).rejects.toThrow()
    })

    it('should throw error when decrypting with wrong password (legacy format)', async () => {
      const correctKey = 'correctPassword'
      const wrongKey = 'wrongPassword'
      const data = 'secret data'

      const encryptedData = await encryptWithAesGcm({
        key: correctKey,
        value: Buffer.from(data, 'utf-8'),
        useSalt: false,
      })

      await expect(async () => {
        await decryptWithAesGcm({
          key: wrongKey,
          value: encryptedData,
          useSalt: false,
        })
      }).rejects.toThrow()
    })

    it('should throw error when using wrong format flag', async () => {
      const key = 'testPassword'
      const data = 'test data'

      // Encrypt with salt
      const encryptedWithSalt = await encryptWithAesGcm({
        key,
        value: Buffer.from(data, 'utf-8'),
        useSalt: true,
      })

      // Try to decrypt without salt flag
      await expect(async () => {
        await decryptWithAesGcm({
          key,
          value: encryptedWithSalt,
          useSalt: false,
        })
      }).rejects.toThrow()
    })
  })
})
