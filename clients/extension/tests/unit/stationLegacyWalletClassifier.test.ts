import { describe, expect, it } from 'vitest'

import { classifyStationLegacyWalletStorage } from '@clients/extension/src/storage/stationLegacyWalletClassifier'

const walletAddress = 'terra1stationaddress'
const encrypted330 = 'encrypted-private-key-330'
const encrypted118 = 'encrypted-private-key-118'

describe('classifyStationLegacyWalletStorage', () => {
  it('classifies mnemonic wallets with encrypted seed and mnemonic material', () => {
    const result = classifyStationLegacyWalletStorage({
      connectedWallet: 'Mnemonic Wallet',
      passwordChallenge: 'encrypted-challenge',
      wallets: JSON.stringify([
        {
          name: 'Mnemonic Wallet',
          words: { '330': walletAddress, '118': 'terra1classic' },
          pubkey: { '330': 'pubkey-330' },
          encryptedSeed: 'encrypted-seed',
          encryptedMnemonic: 'encrypted-mnemonic',
          index: 2,
          legacy: false,
        },
      ]),
    })

    expect(result.metadata).toMatchObject({
      connectedWallet: 'Mnemonic Wallet',
      hasPasswordChallenge: true,
      isMigrationDone: false,
      storageKeysDetected: ['wallets'],
    })
    expect(result.wallets).toHaveLength(1)
    expect(result.wallets[0]).toMatchObject({
      walletName: 'Mnemonic Wallet',
      storageKey: 'wallets',
      storageIndex: 0,
      walletType: 'mnemonic',
      status: 'supported',
      metadata: {
        encryptedSeed: 'encrypted-seed',
        encryptedMnemonic: 'encrypted-mnemonic',
        index: 2,
        words: { '330': walletAddress, '118': 'terra1classic' },
      },
    })
  })

  it('classifies seed-only wallets without requiring a mnemonic', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        {
          name: 'Seed Wallet',
          words: { '330': walletAddress },
          encryptedSeed: 'encrypted-seed',
          index: 0,
          legacy: true,
        },
      ]),
    })

    expect(result.wallets[0]).toMatchObject({
      walletName: 'Seed Wallet',
      walletType: 'seed',
      status: 'supported',
      metadata: {
        encryptedSeed: 'encrypted-seed',
        index: 0,
        legacy: true,
      },
    })
  })

  it('classifies raw/private-key wallets stored as an encrypted string', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        {
          name: 'Private Key Wallet',
          words: { '330': walletAddress },
          encrypted: encrypted330,
        },
      ]),
    })

    expect(result.wallets[0]).toMatchObject({
      walletName: 'Private Key Wallet',
      walletType: 'privateKey',
      status: 'supported',
      metadata: {
        encrypted: encrypted330,
      },
    })
  })

  it('classifies interchain encrypted private-key objects with 330 and optional 118', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        {
          name: 'Interchain Wallet',
          words: { '330': walletAddress, '118': 'terra1classic' },
          encrypted: {
            '330': encrypted330,
            '118': encrypted118,
          },
        },
      ]),
    })

    expect(result.wallets[0]).toMatchObject({
      walletName: 'Interchain Wallet',
      walletType: 'interchainPrivateKey',
      status: 'supported',
      metadata: {
        encrypted: {
          '330': encrypted330,
          '118': encrypted118,
        },
      },
    })
  })

  it('classifies legacy keys storage entries', () => {
    const result = classifyStationLegacyWalletStorage({
      keys: JSON.stringify([
        {
          name: 'Legacy Keys Wallet',
          address: walletAddress,
          encrypted: encrypted330,
        },
      ]),
    })

    expect(result.metadata.storageKeysDetected).toEqual(['keys'])
    expect(result.wallets[0]).toMatchObject({
      walletName: 'Legacy Keys Wallet',
      storageKey: 'keys',
      walletType: 'privateKey',
      status: 'supported',
      metadata: {
        address: walletAddress,
        encrypted: encrypted330,
      },
    })
  })

  it('classifies super-legacy wallet blobs as private-key import candidates', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        {
          name: 'Super Legacy Wallet',
          address: walletAddress,
          wallet: 'encrypted-json-private-key-blob',
        },
      ]),
    })

    expect(result.wallets[0]).toMatchObject({
      walletName: 'Super Legacy Wallet',
      walletType: 'legacyPrivateKey',
      status: 'supported',
      metadata: {
        wallet: 'encrypted-json-private-key-blob',
      },
    })
  })

  it('classifies Ledger wallets as unsupported public metadata entries', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        {
          name: 'Ledger Wallet',
          words: { '330': walletAddress },
          pubkey: { '330': 'ledger-pubkey' },
          ledger: true,
          index: 4,
          bluetooth: false,
          legacy: false,
        },
      ]),
    })

    expect(result.wallets[0]).toMatchObject({
      walletName: 'Ledger Wallet',
      walletType: 'ledger',
      status: 'unsupported',
      reasonCode: 'ledgerPublicMetadataOnly',
      reason:
        'Station only stores public Ledger metadata. It does not store private keys that can be converted into a Vultisig vault.',
      metadata: {
        index: 4,
        pubkey: { '330': 'ledger-pubkey' },
      },
    })
  })

  it('classifies multisig wallets as unsupported metadata-only entries', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        {
          name: 'Multisig Wallet',
          words: { '330': walletAddress },
          multisig: true,
          pubkeys: ['pubkey-a', 'pubkey-b'],
          threshold: 2,
        },
      ]),
    })

    expect(result.wallets[0]).toMatchObject({
      walletName: 'Multisig Wallet',
      walletType: 'multisig',
      status: 'unsupported',
      reasonCode: 'multisigPublicMetadataOnly',
      reason:
        'Station only stores public multisig metadata. It does not store private keys that can be converted into a Vultisig vault.',
      metadata: {
        threshold: 2,
      },
    })
  })

  it('returns a corrupt result for malformed JSON without throwing', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: '{not-json',
    })

    expect(result.wallets).toEqual([
      {
        walletName: 'wallets',
        source: 'localStorage',
        storageKey: 'wallets',
        walletType: 'corruptStorage',
        status: 'corrupt',
        reasonCode: 'malformedJson',
        reason: 'wallets contains malformed JSON.',
        metadata: {},
      },
    ])
  })

  it('returns an unsupported result for unknown object shapes', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        {
          name: 'Mystery Wallet',
          words: { '330': walletAddress },
          custom: 'value',
        },
      ]),
    })

    expect(result.wallets[0]).toMatchObject({
      walletName: 'Mystery Wallet',
      walletType: 'unknown',
      status: 'unsupported',
      reason: 'Wallet entry does not match any known Station storage shape.',
      reasonCode: 'unknownWalletShape',
    })
  })

  it('returns no wallets for empty or missing Station storage', () => {
    expect(classifyStationLegacyWalletStorage({}).wallets).toEqual([])
    expect(
      classifyStationLegacyWalletStorage({ wallets: '', keys: null }).wallets
    ).toEqual([])
  })

  it('returns corrupt wallet results for malformed entries instead of throwing', () => {
    const result = classifyStationLegacyWalletStorage({
      wallets: JSON.stringify([
        null,
        {
          name: 'Broken Interchain',
          encrypted: { '118': encrypted118 },
        },
      ]),
    })

    expect(result.wallets).toEqual([
      {
        walletName: 'wallets[0]',
        source: 'localStorage',
        storageKey: 'wallets',
        storageIndex: 0,
        walletType: 'corruptWallet',
        status: 'corrupt',
        reasonCode: 'walletEntryNotObject',
        reason: 'Wallet entry is not an object.',
        metadata: {},
      },
      {
        walletName: 'Broken Interchain',
        source: 'localStorage',
        storageKey: 'wallets',
        storageIndex: 1,
        walletType: 'corruptWallet',
        status: 'corrupt',
        reasonCode: 'encryptedPrivateKeyMissing330',
        reason: 'encrypted private-key object is missing coin type 330.',
        metadata: {
          encrypted: {
            '118': encrypted118,
          },
        },
      },
    ])
  })
})
