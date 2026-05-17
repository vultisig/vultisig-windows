import type {
  PasscodeUnlockSession,
  PasscodeUnlockSessionStorage,
} from '@core/ui/storage/passcodeUnlockSession'

/** Key in `chrome.storage.session` only; value is never mirrored to local/sync storage. */
export const passcodeUnlockSessionChromeStorageKey =
  'extensionPasscodeUnlockSession'

type StoredPayloadV1 = {
  v: 1
  passcode: string
  expiresAt: number | null
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value)

const isString = (value: unknown): value is string => typeof value === 'string'

const parsePayload = (raw: unknown): StoredPayloadV1 | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null
  }

  if (!('v' in raw) || raw.v !== 1) {
    return null
  }

  if (!('passcode' in raw) || !isString(raw.passcode)) {
    return null
  }

  if (!('expiresAt' in raw)) {
    return null
  }

  const { expiresAt } = raw

  if (expiresAt !== null && !isNumber(expiresAt)) {
    return null
  }

  return { v: 1, passcode: raw.passcode, expiresAt }
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
        return null
      }

      if (parsed.expiresAt !== null && Date.now() > parsed.expiresAt) {
        await area.remove(passcodeUnlockSessionChromeStorageKey)
        return null
      }

      return {
        passcode: parsed.passcode,
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

    const payload: StoredPayloadV1 = {
      v: 1,
      passcode: value.passcode,
      expiresAt: value.expiresAt,
    }

    try {
      await area.set({
        [passcodeUnlockSessionChromeStorageKey]: payload,
      })
    } catch {
      // ignore — session persistence is best-effort
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
