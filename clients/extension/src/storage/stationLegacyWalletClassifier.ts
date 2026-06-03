export const stationLegacyStorageKeys: {
  wallets: 'wallets'
  keys: 'keys'
  passwordChallenge: 'passwordChallenge'
  connectedWallet: 'connectedWallet'
  isMigrationDone: 'isMigrationDone'
} = {
  wallets: 'wallets',
  keys: 'keys',
  passwordChallenge: 'passwordChallenge',
  connectedWallet: 'connectedWallet',
  isMigrationDone: 'isMigrationDone',
}

export type StationLegacyWalletStorageKey =
  | typeof stationLegacyStorageKeys.wallets
  | typeof stationLegacyStorageKeys.keys

export type StationLegacyStorageSnapshot = Record<
  string,
  string | null | undefined
>

export type StationLegacyWalletType =
  | 'mnemonic'
  | 'seed'
  | 'privateKey'
  | 'interchainPrivateKey'
  | 'legacyPrivateKey'
  | 'ledger'
  | 'multisig'
  | 'unknown'
  | 'corruptStorage'
  | 'corruptWallet'

export type StationLegacyWalletStatus = 'supported' | 'unsupported' | 'corrupt'

export type StationLegacyWalletReasonCode =
  | 'ledgerPublicMetadataOnly'
  | 'multisigPublicMetadataOnly'
  | 'encryptedSeedNotString'
  | 'encryptedInvalidShape'
  | 'encryptedPrivateKeyMissing330'
  | 'legacyWalletBlobNotString'
  | 'unknownWalletShape'
  | 'malformedJson'
  | 'storageNotArray'
  | 'walletEntryNotObject'

export type StationLegacyWalletMetadata = {
  address?: string
  bluetooth?: boolean
  encrypted?: string | Record<string, string>
  encryptedMnemonic?: string
  encryptedSeed?: string
  icon?: string
  index?: number
  ledger?: boolean
  legacy?: boolean
  lock?: boolean
  pubkey?: Record<string, string>
  pubkeys?: string[]
  threshold?: number
  wallet?: string
  words?: Record<string, string>
}

export type StationLegacyWalletClassification = {
  walletName: string
  source: 'localStorage'
  storageKey: StationLegacyWalletStorageKey
  storageIndex?: number
  walletType: StationLegacyWalletType
  status: StationLegacyWalletStatus
  reasonCode?: StationLegacyWalletReasonCode
  reason?: string
  metadata: StationLegacyWalletMetadata
}

export type StationLegacyStorageClassification = {
  wallets: StationLegacyWalletClassification[]
  metadata: {
    connectedWallet?: string
    hasPasswordChallenge: boolean
    isMigrationDone: boolean
    storageKeysDetected: StationLegacyWalletStorageKey[]
  }
}

const ledgerUnsupportedReason =
  'Station only stores public Ledger metadata. It does not store private keys that can be converted into a Vultisig vault.'

const multisigUnsupportedReason =
  'Station only stores public multisig metadata. It does not store private keys that can be converted into a Vultisig vault.'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getString = (
  record: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = record[key]

  return typeof value === 'string' ? value : undefined
}

const getBoolean = (
  record: Record<string, unknown>,
  key: string
): boolean | undefined => {
  const value = record[key]

  return typeof value === 'boolean' ? value : undefined
}

const getNumber = (
  record: Record<string, unknown>,
  key: string
): number | undefined => {
  const value = record[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

const getStringRecord = (
  record: Record<string, unknown>,
  key: string
): Record<string, string> | undefined => {
  const value = record[key]
  if (!isRecord(value)) return undefined

  const result: Record<string, string> = {}

  Object.entries(value).forEach(([entryKey, entryValue]) => {
    if (typeof entryValue === 'string') {
      result[entryKey] = entryValue
    }
  })

  return result
}

const getStringArray = (
  record: Record<string, unknown>,
  key: string
): string[] | undefined => {
  const value = record[key]
  if (!Array.isArray(value)) return undefined
  if (!value.every(item => typeof item === 'string')) return undefined

  return value
}

const getWalletName = (
  record: Record<string, unknown>,
  storageKey: StationLegacyWalletStorageKey,
  storageIndex: number
) => getString(record, 'name') ?? `${storageKey}[${storageIndex}]`

const getCommonMetadata = (
  record: Record<string, unknown>
): StationLegacyWalletMetadata => {
  const metadata: StationLegacyWalletMetadata = {}
  const encrypted = record.encrypted
  const encryptedRecord = getStringRecord(record, 'encrypted')
  const fields = {
    address: getString(record, 'address'),
    bluetooth: getBoolean(record, 'bluetooth'),
    encrypted: typeof encrypted === 'string' ? encrypted : encryptedRecord,
    encryptedMnemonic: getString(record, 'encryptedMnemonic'),
    encryptedSeed: getString(record, 'encryptedSeed'),
    icon: getString(record, 'icon'),
    index: getNumber(record, 'index'),
    ledger: getBoolean(record, 'ledger'),
    legacy: getBoolean(record, 'legacy'),
    lock: getBoolean(record, 'lock'),
    pubkey: getStringRecord(record, 'pubkey'),
    pubkeys: getStringArray(record, 'pubkeys'),
    threshold: getNumber(record, 'threshold'),
    wallet: getString(record, 'wallet'),
    words: getStringRecord(record, 'words'),
  }

  if (fields.address !== undefined) metadata.address = fields.address
  if (fields.bluetooth !== undefined) metadata.bluetooth = fields.bluetooth
  if (fields.encrypted !== undefined) metadata.encrypted = fields.encrypted
  if (fields.encryptedMnemonic !== undefined) {
    metadata.encryptedMnemonic = fields.encryptedMnemonic
  }
  if (fields.encryptedSeed !== undefined) {
    metadata.encryptedSeed = fields.encryptedSeed
  }
  if (fields.icon !== undefined) metadata.icon = fields.icon
  if (fields.index !== undefined) metadata.index = fields.index
  if (fields.ledger !== undefined) metadata.ledger = fields.ledger
  if (fields.legacy !== undefined) metadata.legacy = fields.legacy
  if (fields.lock !== undefined) metadata.lock = fields.lock
  if (fields.pubkey !== undefined) metadata.pubkey = fields.pubkey
  if (fields.pubkeys !== undefined) metadata.pubkeys = fields.pubkeys
  if (fields.threshold !== undefined) metadata.threshold = fields.threshold
  if (fields.wallet !== undefined) metadata.wallet = fields.wallet
  if (fields.words !== undefined) metadata.words = fields.words

  return metadata
}

const createClassification = ({
  record,
  reason,
  reasonCode,
  status,
  storageIndex,
  storageKey,
  walletType,
}: {
  record: Record<string, unknown>
  reason?: string
  reasonCode?: StationLegacyWalletReasonCode
  status: StationLegacyWalletStatus
  storageIndex: number
  storageKey: StationLegacyWalletStorageKey
  walletType: StationLegacyWalletType
}): StationLegacyWalletClassification => ({
  walletName: getWalletName(record, storageKey, storageIndex),
  source: 'localStorage',
  storageKey,
  storageIndex,
  walletType,
  status,
  reasonCode,
  reason,
  metadata: getCommonMetadata(record),
})

const createStorageCorruptionResult = ({
  reason,
  reasonCode,
  storageKey,
}: {
  reason: string
  reasonCode: StationLegacyWalletReasonCode
  storageKey: StationLegacyWalletStorageKey
}): StationLegacyWalletClassification => ({
  walletName: storageKey,
  source: 'localStorage',
  storageKey,
  walletType: 'corruptStorage',
  status: 'corrupt',
  reasonCode,
  reason,
  metadata: {},
})

const classifyWalletRecord = ({
  record,
  storageIndex,
  storageKey,
}: {
  record: Record<string, unknown>
  storageIndex: number
  storageKey: StationLegacyWalletStorageKey
}): StationLegacyWalletClassification => {
  if (record.ledger === true) {
    return createClassification({
      record,
      reason: ledgerUnsupportedReason,
      reasonCode: 'ledgerPublicMetadataOnly',
      status: 'unsupported',
      storageIndex,
      storageKey,
      walletType: 'ledger',
    })
  }

  if (record.multisig === true) {
    return createClassification({
      record,
      reason: multisigUnsupportedReason,
      reasonCode: 'multisigPublicMetadataOnly',
      status: 'unsupported',
      storageIndex,
      storageKey,
      walletType: 'multisig',
    })
  }

  if ('encryptedSeed' in record) {
    if (typeof record.encryptedSeed !== 'string') {
      return createClassification({
        record,
        reason: 'encryptedSeed is present but is not a string.',
        reasonCode: 'encryptedSeedNotString',
        status: 'corrupt',
        storageIndex,
        storageKey,
        walletType: 'corruptWallet',
      })
    }

    return createClassification({
      record,
      status: 'supported',
      storageIndex,
      storageKey,
      walletType:
        typeof record.encryptedMnemonic === 'string' ? 'mnemonic' : 'seed',
    })
  }

  if ('encrypted' in record) {
    if (typeof record.encrypted === 'string') {
      return createClassification({
        record,
        status: 'supported',
        storageIndex,
        storageKey,
        walletType: 'privateKey',
      })
    }

    if (!isRecord(record.encrypted)) {
      return createClassification({
        record,
        reason: 'encrypted is present but is neither a string nor an object.',
        reasonCode: 'encryptedInvalidShape',
        status: 'corrupt',
        storageIndex,
        storageKey,
        walletType: 'corruptWallet',
      })
    }

    if (typeof record.encrypted['330'] !== 'string') {
      return createClassification({
        record,
        reason: 'encrypted private-key object is missing coin type 330.',
        reasonCode: 'encryptedPrivateKeyMissing330',
        status: 'corrupt',
        storageIndex,
        storageKey,
        walletType: 'corruptWallet',
      })
    }

    return createClassification({
      record,
      status: 'supported',
      storageIndex,
      storageKey,
      walletType: 'interchainPrivateKey',
    })
  }

  if ('wallet' in record) {
    if (typeof record.wallet !== 'string') {
      return createClassification({
        record,
        reason: 'legacy wallet blob is present but is not a string.',
        reasonCode: 'legacyWalletBlobNotString',
        status: 'corrupt',
        storageIndex,
        storageKey,
        walletType: 'corruptWallet',
      })
    }

    return createClassification({
      record,
      status: 'supported',
      storageIndex,
      storageKey,
      walletType: 'legacyPrivateKey',
    })
  }

  return createClassification({
    record,
    reason: 'Wallet entry does not match any known Station storage shape.',
    reasonCode: 'unknownWalletShape',
    status: 'unsupported',
    storageIndex,
    storageKey,
    walletType: 'unknown',
  })
}

const parseWallets = ({
  raw,
  storageKey,
}: {
  raw: string | null | undefined
  storageKey: StationLegacyWalletStorageKey
}): StationLegacyWalletClassification[] => {
  if (!raw) return []

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return [
      createStorageCorruptionResult({
        reason: `${storageKey} contains malformed JSON.`,
        reasonCode: 'malformedJson',
        storageKey,
      }),
    ]
  }

  if (!Array.isArray(parsed)) {
    return [
      createStorageCorruptionResult({
        reason: `${storageKey} must be a JSON array.`,
        reasonCode: 'storageNotArray',
        storageKey,
      }),
    ]
  }

  return parsed.map((record, storageIndex) => {
    if (!isRecord(record)) {
      return {
        walletName: `${storageKey}[${storageIndex}]`,
        source: 'localStorage',
        storageKey,
        storageIndex,
        walletType: 'corruptWallet',
        status: 'corrupt',
        reasonCode: 'walletEntryNotObject',
        reason: 'Wallet entry is not an object.',
        metadata: {},
      }
    }

    return classifyWalletRecord({ record, storageIndex, storageKey })
  })
}

/**
 * Classifies legacy Station localStorage snapshots without reading or writing browser storage.
 */
export const classifyStationLegacyWalletStorage = (
  snapshot: StationLegacyStorageSnapshot
): StationLegacyStorageClassification => {
  const storageKeysDetected: StationLegacyWalletStorageKey[] = []
  const wallets = [
    stationLegacyStorageKeys.wallets,
    stationLegacyStorageKeys.keys,
  ].flatMap(storageKey => {
    const raw = snapshot[storageKey]
    if (raw) storageKeysDetected.push(storageKey)

    return parseWallets({ raw, storageKey })
  })

  const connectedWallet = snapshot[stationLegacyStorageKeys.connectedWallet]

  return {
    wallets,
    metadata: {
      connectedWallet:
        typeof connectedWallet === 'string' ? connectedWallet : undefined,
      hasPasswordChallenge: Boolean(
        snapshot[stationLegacyStorageKeys.passwordChallenge]
      ),
      isMigrationDone:
        snapshot[stationLegacyStorageKeys.isMigrationDone] === 'true',
      storageKeysDetected,
    },
  }
}
