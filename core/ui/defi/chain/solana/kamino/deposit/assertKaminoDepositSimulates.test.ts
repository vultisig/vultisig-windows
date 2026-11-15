import { PublicKey } from '@solana/web3.js'
import { kaminoTokenAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { kaminoConfig } from '@vultisig/core-chain/chains/solana/kamino/config'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { parseKaminoWireTransaction } from '@vultisig/core-chain/chains/solana/kamino/tx/wire'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const client = {
  simulateTransaction: vi.fn(),
  getBalance: vi.fn(),
  getMinimumBalanceForRentExemption: vi.fn(),
  getMultipleAccountsInfo: vi.fn(),
}

vi.mock('@vultisig/core-chain/chains/solana/client', () => ({
  getSolanaClient: () => client,
}))
vi.mock(
  '@vultisig/core-chain/chains/solana/kamino/tx/wire',
  async importOriginal => ({
    ...(await importOriginal<
      typeof import('@vultisig/core-chain/chains/solana/kamino/tx/wire')
    >()),
    // Every account the shortfall reads is a static key, so a placeholder per
    // table-loaded slot keeps the indexes right without the network.
    resolveKaminoLookupTables: vi.fn().mockResolvedValue({}),
    resolveKaminoAccountAddresses: vi.fn(
      ({ transaction }: { transaction: VersionedTransactionLike }) => [
        ...transaction.message.staticAccountKeys.map(key => key.toBase58()),
        ...transaction.message.addressTableLookups
          .flatMap(lookup => [
            ...lookup.writableIndexes,
            ...lookup.readonlyIndexes,
          ])
          .map(() => PublicKey.default.toBase58()),
      ]
    ),
  })
)
// Echoes the interpolation values, so a test sees the figures a message carries.
vi.mock('i18next', () => ({
  t: (key: string, values?: Record<string, string>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}))

import {
  assertKaminoDepositSimulates,
  classifyKaminoSimulationFailure,
  KaminoDepositRefusedError,
  kaminoDepositShortfall,
} from './assertKaminoDepositSimulates'

type VersionedTransactionLike = {
  message: {
    staticAccountKeys: PublicKey[]
    addressTableLookups: {
      writableIndexes: number[]
      readonlyIndexes: number[]
    }[]
  }
}

// A first USDC deposit Kamino built on mainnet: createIdempotent for the share
// account, the vault deposit, farms initialize_user, farms stake.
const firstUsdcDeposit = [
  'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAACAAQAFCX6MCIdgv94d3c8ywX8gm4JC7lKq8TH6zYjQ6ixtCwbyi2G+J7Tt',
  'whmmIGAksFHWHBRuD3RE+zBbFhbNlyaHUS/T6oz1rKyozQUgdRIXXEPO9Upd2Z7eIKFrVSU3',
  'OPOX3AwoNIw0S/83XKQnpefdOo4z5yPOpkC2dDdTPAbIHsm7AAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAP2mzp9mGY3YcNiphvMGdcRvg+L1KDSHlS9dUFY+PveoyXJY9OJInx',
  'uz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZ2LAQF2PT5R8SbmFW3oXejGEwWbhEaNDaP+iioiUc',
  'xwEE2Qrx24k57DX/lNlkDVfcwyeUuz4btm/TroSahNzblN76Ws6qir7XRG1XkeCtBuHFqihT',
  'JrTDGrQlDXGSFqA+BAYGAAMACQQaAQEIFQARDRYUCQIDGBoaBQgQDwoMFRMXEhDyI8aJUuHy',
  'toCWmAAAAAAABwgAAAAAAQsEGQhvEbn6PHom/gcIAAELDgMJBxoQzrDKEsjRs2z/////////',
  '/wGC6dRmw0Z9LrKw2cy+tHvb9JXuHBu0d9Dar60DX6fr5AkFNTElLzITCQEJJxUECwI3BwYD',
].join('')
const shareAccount = 'pTT7BQ26zy2YkBzNk3m7ywK4E4h4XD6oL2ns5SiJTnA'

// A first SOL-vault deposit of 0.5 SOL: opens the wrapped-SOL and share
// accounts, wraps, deposits, initializes the farm user state, stakes.
const firstSolDeposit = [
  'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAACAAQAGDH6MCIdgv94d3c8ywX8gm4JC7lKq8TH6zYjQ6ixtCwbyJnd9pKyN',
  'Wm8rX5WMWlaRpEuaYsAMd/0uKk2HNuILqFNNvPvC4A7dhX1ZJyo29DiuibPP/uANSC1jj19q',
  'JzEK31tWVuPJV5ITcuOIn1fHs4hHodajEBxE75fcJD2QevvWbQ/ffN89KMzS1moKr3xD+eaL',
  'jFLD93Uu7/6fCChoRW/6HoLYlf5IbdNEuFQby9p5byRMsWwK5OpCzyixXzveqAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD9ps6fZhmN2HDYqYbzBnXEb4Pi9Sg0h5UvXVBWPj',
  '73qMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WdiwEBdj0+UfEm5hVt6F3oxhMFm4',
  'RGjQ2j/ooqIlHMcBBNkK8duJOew1/5TZZA1X3MMnlLs+G7Zv066EmoTc25QG3fbh12Whk9nL',
  '4UbO63msHLSF7V9bN5E6jPWFfv8AqQratdTZskh3RX3JYgwHZm2POqig2u19lkObE1kyFxBn',
  'BwgGAAQAHQYLAQEGAgAEDAIAAAAAZc0dAAAAAAsBBAERCAYAAwASBgsBAQoZAA8FHRYSBAMc',
  'CwsHCg4QDRQRDBsVFxgaGRDyI8aJUuHytgBlzR0AAAAACQgAAAAAAhMGHghvEbn6PHom/gkI',
  'AAITAQMSCQsQzrDKEsjRs2z//////////wFcvAkvUgYmlpRjmt1MX98IzA/9elzQ9ld+Vs/y',
  'AHeYyAlbGwkBEjwFUDEKFAQdM0g+CwcCBg==',
].join('')

const [steakhouse] = kaminoVaultRegistry
const vault = {
  descriptor: steakhouse,
  name: 'Steakhouse USDC',
  minDeposit: kaminoTokenAmount(100_100n, 6),
  minWithdraw: { unit: 'kaminoShare' as const, baseUnits: 2848n, decimals: 6 },
  lookupTable: 'D9pGqvkAaPJXjrbngmL3xeFbxNWDn1DrMYnV9vWKgHrE',
  apy30d: 0.0418,
  tokensPerShare: { numerator: 10536041812651029025n, scale: 19 },
  tokenPriceUsd: 1,
}

const transaction = parseKaminoWireTransaction(firstUsdcDeposit)
if (!transaction) throw new Error('fixture does not parse')

const input = {
  transaction,
  vault,
  owner: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  amount: kaminoTokenAmount(10_000_000n, 6),
  ticker: 'USDC',
  unitLimit: 320_000,
  unitPriceMicroLamports: 20_000n,
}

// Mainnet rent at 5,080 lamports a byte, for a wallet holding 0.00316 SOL.
const rentBySize: Record<number, number> = {
  0: 650_240,
  165: 1_488_440,
  920: 5_323_840,
}

const refuse = (err: unknown, logs: string[] = []) =>
  client.simulateTransaction.mockResolvedValue({ value: { err, logs } })

beforeEach(() => {
  vi.clearAllMocks()
  client.getBalance.mockResolvedValue(3_156_865)
  client.getMinimumBalanceForRentExemption.mockImplementation(
    async (size: number) => rentBySize[size]
  )
  client.getMultipleAccountsInfo.mockImplementation(async (keys: unknown[]) =>
    keys.map(() => null)
  )
})

describe('classifyKaminoSimulationFailure', () => {
  it('reads the System program running out as SOL', () => {
    expect(
      classifyKaminoSimulationFailure({
        err: { InstructionError: [2, { Custom: 1 }] },
        logs: ['Transfer: insufficient lamports 1663425, need 5323840'],
      })
    ).toBe('insufficientSol')
  })

  it('reads a payer with no SOL, or not enough for the fee, as SOL', () => {
    for (const err of ['AccountNotFound', 'InsufficientFundsForFee']) {
      expect(classifyKaminoSimulationFailure({ err, logs: [] })).toBe(
        'insufficientSol'
      )
    }
  })

  it('reads a missing program as something else, not SOL', () => {
    expect(
      classifyKaminoSimulationFailure({
        err: 'ProgramAccountNotFound',
        logs: [],
      })
    ).toBe('other')
  })

  it('reads only the payer falling below its rent minimum as SOL', () => {
    expect(
      classifyKaminoSimulationFailure({
        err: { InsufficientFundsForRent: { account_index: 0 } },
        logs: [],
      })
    ).toBe('insufficientSol')
    expect(
      classifyKaminoSimulationFailure({
        err: { InsufficientFundsForRent: { account_index: 3 } },
        logs: [],
      })
    ).toBe('other')
  })

  it('reads the Token program running out as the token', () => {
    expect(
      classifyKaminoSimulationFailure({
        err: { InstructionError: [1, { Custom: 1 }] },
        logs: [
          'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x1',
        ],
      })
    ).toBe('insufficientToken')
  })

  it('leaves everything else to the runtime', () => {
    expect(
      classifyKaminoSimulationFailure({
        err: { InstructionError: [5, 'ProgramFailedToComplete'] },
        logs: [
          'Program FarmsPZpWu9i7Kky8tPN37rs2TpmMrAZrC7S7vJa91Hr failed: exceeded CUs meter at BPF instruction',
        ],
      })
    ).toBe('other')
  })
})

describe('kaminoDepositShortfall', () => {
  it('counts fees, every account the deposit opens, and the wallet minimum', async () => {
    expect(await kaminoDepositShortfall(input)).toEqual({
      needed: 5_000n + 6_400n + 1_488_440n + 5_323_840n + 650_240n,
      available: 3_156_865n,
    })
  })

  it('counts the amount and both accounts a SOL-vault deposit opens', async () => {
    const solVault = kaminoVaultRegistry.find(
      ({ tokenMint }) => tokenMint === kaminoConfig.wrappedSolMint
    )
    const solTransaction = parseKaminoWireTransaction(firstSolDeposit)
    if (!solVault || !solTransaction) throw new Error('SOL fixture unusable')

    expect(
      await kaminoDepositShortfall({
        ...input,
        transaction: solTransaction,
        vault: { ...vault, descriptor: solVault },
        amount: kaminoTokenAmount(500_000_000n, 9),
        ticker: 'SOL',
        unitLimit: 350_000,
      })
    ).toEqual({
      needed:
        5_000n +
        7_000n +
        2n * 1_488_440n +
        5_323_840n +
        650_240n +
        500_000_000n,
      available: 3_156_865n,
    })
  })

  it('charges no rent for a share account that already exists', async () => {
    client.getMultipleAccountsInfo.mockImplementation(
      async (keys: PublicKey[]) =>
        keys.map(key => (key.toBase58() === shareAccount ? {} : null))
    )

    expect((await kaminoDepositShortfall(input)).needed).toBe(
      5_000n + 6_400n + 5_323_840n + 650_240n
    )
  })
})

describe('assertKaminoDepositSimulates', () => {
  it('passes a deposit that simulates cleanly', async () => {
    refuse(null)
    await expect(assertKaminoDepositSimulates(input)).resolves.toBeUndefined()
  })

  it('refuses a SOL shortfall with the amounts when they can be read', async () => {
    refuse({ InstructionError: [2, { Custom: 1 }] }, [
      'Transfer: insufficient lamports 1663425, need 5323840',
    ])
    await expect(assertKaminoDepositSimulates(input)).rejects.toEqual(
      new KaminoDepositRefusedError(
        'kamino_earn_insufficient_sol_amounts {"needed":"0.00747392 SOL","available":"0.00315687 SOL"}'
      )
    )
  })

  it('still refuses a SOL shortfall when the amounts cannot be read', async () => {
    refuse('AccountNotFound')
    client.getBalance.mockRejectedValue(new Error('rpc down'))
    await expect(assertKaminoDepositSimulates(input)).rejects.toEqual(
      new KaminoDepositRefusedError('kamino_earn_insufficient_sol')
    )
  })

  it('drops amounts that would say the vault can pay', async () => {
    refuse({ InstructionError: [2, { Custom: 1 }] }, [
      'Transfer: insufficient lamports 1663425, need 5323840',
    ])
    client.getBalance.mockResolvedValue(50_000_000)
    await expect(assertKaminoDepositSimulates(input)).rejects.toEqual(
      new KaminoDepositRefusedError('kamino_earn_insufficient_sol')
    )
  })

  it('names the token when the token runs out', async () => {
    refuse({ InstructionError: [1, { Custom: 1 }] }, [
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x1',
    ])
    await expect(assertKaminoDepositSimulates(input)).rejects.toEqual(
      new KaminoDepositRefusedError(
        'kamino_earn_insufficient_token {"ticker":"USDC"}'
      )
    )
  })

  it('refuses anything else with the runtime reason', async () => {
    refuse({ InstructionError: [1, { Custom: 6003 }] })
    await expect(assertKaminoDepositSimulates(input)).rejects.toEqual(
      new KaminoDepositRefusedError(
        'kamino_earn_simulation_failed {"reason":"{\\"InstructionError\\":[1,{\\"Custom\\":6003}]}"}'
      )
    )
  })
})
