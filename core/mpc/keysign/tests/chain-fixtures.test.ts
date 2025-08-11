import fs from 'node:fs'
import path from 'node:path'

import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'

import { getTxInputData } from '../txInputData'
import { normalizeKeysignPayloadFromJson } from './helpers/normalizeKeysignPayloadFromJson'
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

describe('iOS fixtures parity', () => {
  const cases = loadAllCases()

  it.each(cases)('%s', ({ keysign_payload, expected_image_hash }) => {
    const keysignPayload = normalizeKeysignPayloadFromJson(keysign_payload)
    const chain = resolveChainFromFixture(keysign_payload.coin.chain)
    const inputs = getTxInputData({
      keysignPayload,
      walletCore,
    })

    const hashes = inputs
      .flatMap(txInputData =>
        getPreSigningHashes({ walletCore, chain, txInputData })
      )
      .map(item => Buffer.from(item).toString('hex'))
      .sort()

    const expected = [...expected_image_hash].sort()
    expect(hashes).toEqual(expected)
  })
})
