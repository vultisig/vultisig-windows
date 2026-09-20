import { create } from '@bufbuild/protobuf'
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getTxBlockaidSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation'
import { BlockaidSolanaSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation/api/core'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { getBlockaidTxSimulationInput } from '@vultisig/core-mpc/security/blockaid/tx/simulation/input'
import { SolanaSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { parseSolanaTx } from './parser'

vi.mock('@vultisig/core-chain/security/blockaid/tx/simulation', () => ({
  getTxBlockaidSimulation: vi.fn(),
}))
vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific: vi.fn(),
}))
vi.mock('@vultisig/core-mpc/security/blockaid/tx/simulation/input', () => ({
  getBlockaidTxSimulationInput: vi.fn(),
}))

const mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const wsol = 'So11111111111111111111111111111111111111112'
type Diff =
  BlockaidSolanaSimulation['account_summary']['account_assets_diff'][number]
const movement = (asset: Diff['asset'], amount: bigint): Diff => {
  const value = {
    raw_value: String(amount < 0n ? -amount : amount),
    value: 0,
    usd_price: 0,
    summary: '',
  }
  return {
    asset,
    asset_type: asset.type,
    in: amount > 0n ? value : null,
    out: amount < 0n ? value : null,
  }
}
const simulation = (sol: bigint, token: bigint): BlockaidSolanaSimulation => ({
  account_summary: {
    account_assets_diff: [
      movement({ type: 'SOL', decimals: 9, logo: '' }, sol),
      movement(
        { type: 'TOKEN', address: wsol, decimals: 9, logo: '' },
        sol > 0n ? -2039280n : 2039280n
      ),
      movement({ type: 'TOKEN', address: mint, decimals: 6, logo: '' }, token),
    ],
  },
})

let walletCore: WalletCore
const sender = Keypair.fromSeed(new Uint8Array(32).fill(1)).publicKey
const transaction = new Transaction({
  feePayer: sender,
  recentBlockhash: wsol,
}).add(
  SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: Keypair.fromSeed(new Uint8Array(32).fill(2)).publicKey,
    lamports: 1,
  })
)
const data = [
  transaction
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString('base64'),
]
const fromCoin = create(CoinSchema, {
  chain: Chain.Solana,
  address: sender.toBase58(),
  ticker: 'SOL',
  decimals: 9,
})
const getCoin = vi.fn(async ({ id }: { id?: string }) =>
  id
    ? { chain: Chain.Solana, id, ticker: 'USDC', decimals: 6, logo: '' }
    : chainFeeCoin.Solana
)
const parse = () =>
  parseSolanaTx({ fromCoin, walletCore, data, getCoin, swapProvider: 'test' })

beforeAll(async () => {
  walletCore = await initWasm()
})
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getChainSpecific).mockResolvedValue({
    case: 'solanaSpecific',
    value: create(SolanaSpecificSchema),
  })
  vi.mocked(getBlockaidTxSimulationInput).mockResolvedValue({
    chain: Chain.Solana,
    data: { account_address: sender.toBase58(), transactions: data },
  })
})

describe('Solana approval with the shared simulation parser', () => {
  it('still decodes instructions when the simulation service is unavailable', async () => {
    vi.mocked(getTxBlockaidSimulation).mockRejectedValue(
      new Error('Unavailable')
    )
    await expect(parse()).resolves.toMatchObject({
      transfer: { inAmount: '1', rawTransactions: data },
    })
  })

  it.each([
    [1000000000n, 1000000n],
    [-1000000000n, -1000000n],
  ])(
    'preserves raw review when complete movements cannot produce a safe headline (%s)',
    async (sol, token) => {
      vi.mocked(getTxBlockaidSimulation).mockResolvedValue(
        simulation(sol, token)
      )
      await expect(parse()).resolves.toMatchObject({
        raw: { transactions: data },
      })
      expect(getCoin).not.toHaveBeenCalled()
    }
  )

  it.each([
    {
      sol: 1000000000n,
      token: -1000000n,
      inputTicker: 'USDC',
      outputTicker: 'SOL',
      input: '1000000',
      output: '997960720',
    },
    {
      sol: -1000000000n,
      token: 1000000n,
      inputTicker: 'SOL',
      outputTicker: 'USDC',
      input: '997960720',
      output: '1000000',
    },
  ])(
    'keeps the full principal direction for $inputTicker to $outputTicker',
    async scenario => {
      vi.mocked(getTxBlockaidSimulation).mockResolvedValue(
        simulation(scenario.sol, scenario.token)
      )
      await expect(parse()).resolves.toMatchObject({
        swap: {
          inputCoin: { ticker: scenario.inputTicker },
          outputCoin: { ticker: scenario.outputTicker },
          inAmount: scenario.input,
          outAmount: scenario.output,
          rawTransactions: data,
        },
      })
    }
  )
})
