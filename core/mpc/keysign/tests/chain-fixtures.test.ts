import fs from 'node:fs'
import path from 'node:path'

import { Chain } from '@core/chain/Chain'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'

import { getCosmosTxInputData } from '../txInputData/cosmos'
import { getEvmTxInputData } from '../txInputData/evm'
import { getRippleTxInputData } from '../txInputData/ripple'
import { getSolanaTxInputData } from '../txInputData/solana'
import { getTonTxInputData } from '../txInputData/ton'
import { getUtxoTxInputData } from '../txInputData/utxo'
import { normalizeFromIosJson } from './helpers/normalizeFromIosJson'
import { resolveChainFromFixture } from './helpers/resolveChainFromFixture'

type Case = {
  name: string
  keysign_payload: any
  expected_image_hash: string[]
}

let walletCore: Awaited<WalletCore>

beforeAll(async () => {
  walletCore = await initWasm()
})

const fixturesDir = path.resolve(__dirname, 'fixtures')

function loadAllCases(): Case[] {
  const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.json'))
  return files.flatMap(file => {
    const raw = fs.readFileSync(path.join(fixturesDir, file), 'utf8')
    return JSON.parse(raw) as Case[]
  })
}

function buildInputs(chain: Chain, payload: any): Uint8Array[] {
  const args = { keysignPayload: payload, walletCore, chain }
  switch (chain) {
    case Chain.Ethereum:
    case Chain.BSC:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Base:
    case Chain.Avalanche:
      return getEvmTxInputData(args as any)

    case Chain.Cosmos:
    case Chain.Kujira:
    case Chain.THORChain:
    case Chain.MayaChain:
    case Chain.Terra:
    case Chain.TerraClassic:
      return getCosmosTxInputData(args as any)

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin:
    case Chain.Zcash:
      return getUtxoTxInputData(args as any)

    case Chain.Solana:
      return getSolanaTxInputData(args as any)
    case Chain.Ripple:
      return getRippleTxInputData(args as any)
    case Chain.Ton:
      return getTonTxInputData(args as any)
    default:
      throw new Error(`Chain not supported in tests: ${Chain[chain] ?? chain}`)
  }
}

const toHex = (b: Uint8Array) => Buffer.from(b).toString('hex')

describe('iOS fixtures parity', () => {
  const cases = loadAllCases()

  it.each(cases)('%s', ({ keysign_payload, expected_image_hash }) => {
    const proto = normalizeFromIosJson(keysign_payload)
    const chain = resolveChainFromFixture(keysign_payload.coin.chain)
    const inputs = buildInputs(chain, proto)

    const hashes = inputs
      .flatMap(txInputData =>
        getPreSigningHashes({ walletCore, chain, txInputData })
      )
      .map(toHex)

    expect(hashes).toEqual(expected_image_hash)
  })
})
