import { Chain } from '@vultisig/core-chain/Chain'
import { expect, it } from 'vitest'

import { getKeyImportChainKeys } from './getKeyImportChainKeys'

it('gives chains on one public key the first session share', () => {
  expect(
    getKeyImportChainKeys([
      { chain: Chain.Ethereum, result: { publicKey: 'evm', keyshare: 'eth' } },
      { chain: Chain.Bitcoin, result: { publicKey: 'btc', keyshare: 'btc' } },
      { chain: Chain.Arbitrum, result: { publicKey: 'evm', keyshare: 'arb' } },
    ])
  ).toEqual({
    chainPublicKeys: { Ethereum: 'evm', Bitcoin: 'btc', Arbitrum: 'evm' },
    chainKeyShares: { Ethereum: 'eth', Bitcoin: 'btc', Arbitrum: 'eth' },
  })
})
