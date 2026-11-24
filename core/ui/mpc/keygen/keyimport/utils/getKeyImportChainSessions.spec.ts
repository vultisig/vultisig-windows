import { Chain } from '@vultisig/core-chain/Chain'
import { expect, it } from 'vitest'

import { getKeyImportChainSessions } from './getKeyImportChainSessions'

it('plans one session per chain, including chains on one derivation path', () => {
  expect(
    getKeyImportChainSessions([Chain.Ethereum, Chain.Arbitrum, Chain.Solana])
  ).toEqual([
    {
      chain: 'Ethereum',
      algorithm: 'ecdsa',
      setupMessageId: 'Ethereum',
      protocolMessageId: 'p-Ethereum',
    },
    {
      chain: 'Arbitrum',
      algorithm: 'ecdsa',
      setupMessageId: 'Arbitrum',
      protocolMessageId: 'p-Arbitrum',
    },
    {
      chain: 'Solana',
      algorithm: 'eddsa',
      setupMessageId: 'Solana',
      protocolMessageId: 'p-Solana',
    },
  ])
})
