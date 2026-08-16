import type {
  PasscodeUnlockSession,
  PasscodeUnlockSessionStorage,
} from '@core/ui/storage/passcodeUnlockSession'

import { openPasscode, sealPasscode } from './passcodeUnlockSessionCipher'

/** Key in `chrome.storage.session` only; value is never mirrored to local/sync storage. */
export const passcodeUnlockSessionChromeStorageKey =
  'extensionPasscodeUnlockSession'

/**
 * Version 2 seals the passcode under a non-extractable key. Version 1 records
 * held it in the clear and are rejected rather than migrated, so an upgrade
 * costs one passcode entry and leaves no plaintext behind.
 */
type StoredPayloadV2 = {
  v: 2
  iv: string
  sealedPasscode: string
  expiresAt: number | null
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value)

const isString = (value: unknown): value is string => typeof value === 'string'

const parsePayload = (raw: unknown): StoredPayloadV2 | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }

  if (!('v' in raw) || raw.v !== 2) {
    return null
  }

  if (!('iv' in raw) || !isString(raw.iv)) {
    return null
  }

  if (!('sealedPasscode' in raw) || !isString(raw.sealedPasscode)) {
    return null
  }

  if (!('expiresAt' in raw)) {
    return null
  }

  const { expiresAt } = raw

  if (expiresAt !== null && !isNumber(expiresAt)) {
    return null
  }

  return {
    v: 2,
    iv: raw.iv,
    sealedPasscode: raw.sealedPasscode,
    expiresAt,
  }
}

const getSessionStorageArea = (): chrome.storage.StorageArea | undefined =>
  typeof chrome !== 'undefined' ? chrome.storage?.session : undefined

export const passcodeUnlockSessionStorage: PasscodeUnlockSessionStorage = {
  get canPersistPasscodeUnlockSession() {
    return getSessionStorageArea() !== undefined
  },
  getPasscodeUnlockSession: async () => {
    const area = getSessionStorageArea()
    if (!area) {
      return null
    }

    try {
      const result = await area.get(passcodeUnlockSessionChromeStorageKey)
      const raw = result[passcodeUnlockSessionChromeStorageKey]
      const parsed = parsePayload(raw)

      if (!parsed) {
        if (raw !== undefined) {
          await area.remove(passcodeUnlockSessionChromeStorageKey)
        }
        return null
      }

      if (parsed.expiresAt !== null && Date.now() > parsed.expiresAt) {
        await area.remove(passcodeUnlockSessionChromeStorageKey)
        return null
      }

      return {
        passcode: await openPasscode(parsed),
        expiresAt: parsed.expiresAt,
      }
    } catch {
      return null
    }
  },
  setPasscodeUnlockSession: async (value: PasscodeUnlockSession) => {
    const area = getSessionStorageArea()
    if (!area) {
      return
    }

    try {
      const { iv, sealedPasscode } = await sealPasscode(value.passcode)

      const payload: StoredPayloadV2 = {
        v: 2,
        iv,
        sealedPasscode,
        expiresAt: value.expiresAt,
      }

      await area.set({
        [passcodeUnlockSessionChromeStorageKey]: payload,
      })
    } catch {
      // ignore — session persistence is best-effort, and a sealing failure must
      // never fall back to writing the passcode in the clear
    }
  },
  clearPasscodeUnlockSession: async () => {
    const area = getSessionStorageArea()
    if (!area) {
      return
    }

    try {
      await area.remove(passcodeUnlockSessionChromeStorageKey)
    } catch {
      // ignore
    }
  },
}
