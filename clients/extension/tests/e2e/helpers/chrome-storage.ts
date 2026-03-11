/**
 * Chrome Storage Helper
 *
 * Utilities for reading/writing chrome.storage.local via CDP.
 * Used by vault-seeding.fixture.ts to pre-seed test vaults.
 */

import type { BrowserContext, Worker } from '@playwright/test'

/**
 * Storage keys used by the extension (matches StorageKey enum)
 */
export const StorageKey = {
  vaults: 'vaults',
  currentVaultId: 'currentVaultId',
  hasFinishedOnboarding: 'hasFinishedOnboarding',
  fiatCurrency: 'fiatCurrency',
  language: 'language',
  addressBook: 'addressBook',
  // SDK vault storage key pattern: `vult:<ecdsaPubkey>`
} as const

/**
 * Get the service worker for chrome.storage access
 */
export async function getServiceWorker(context: BrowserContext): Promise<Worker> {
  let [background] = context.serviceWorkers()
  if (!background) {
    background = await context.waitForEvent('serviceworker', { timeout: 30_000 })
  }
  return background
}

/**
 * Read a value from chrome.storage.local
 */
export async function readChromeStorage<T = unknown>(
  context: BrowserContext,
  key: string
): Promise<T | undefined> {
  const worker = await getServiceWorker(context)

  const result = await worker.evaluate(async (storageKey: string) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([storageKey], (result) => {
        resolve(result[storageKey])
      })
    })
  }, key)

  return result as T | undefined
}

/**
 * Write a value to chrome.storage.local
 */
export async function writeChromeStorage(
  context: BrowserContext,
  key: string,
  value: unknown
): Promise<void> {
  const worker = await getServiceWorker(context)

  await worker.evaluate(async ({ key, value }: { key: string; value: unknown }) => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve()
        }
      })
    })
  }, { key, value })
}

/**
 * Write multiple values to chrome.storage.local
 */
export async function writeChromeStorageMultiple(
  context: BrowserContext,
  items: Record<string, unknown>
): Promise<void> {
  const worker = await getServiceWorker(context)

  await worker.evaluate(async (storageItems: Record<string, unknown>) => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.set(storageItems, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve()
        }
      })
    })
  }, items)
}

/**
 * Clear all chrome.storage.local data
 */
export async function clearChromeStorage(context: BrowserContext): Promise<void> {
  const worker = await getServiceWorker(context)

  await worker.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve()
        }
      })
    })
  })
}

/**
 * Read all chrome.storage.local data
 */
export async function readAllChromeStorage(
  context: BrowserContext
): Promise<Record<string, unknown>> {
  const worker = await getServiceWorker(context)

  const result = await worker.evaluate(async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve(result)
      })
    })
  })

  return result as Record<string, unknown>
}
