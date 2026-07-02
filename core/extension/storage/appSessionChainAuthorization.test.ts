import { Chain } from '@vultisig/core-chain/Chain'
import { getEvmChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { describe, expect, it } from 'vitest'

import {
  getAppSessionFieldsForApprovedChain,
  getAppSessionFieldsForApprovedChains,
  isAppSessionAuthorizedForAccounts,
  isAppSessionAuthorizedForChain,
} from './appSessionChainAuthorization'

describe('app session chain authorization', () => {
  it('marks an approved EVM chain as both authorized and selected', () => {
    expect(getAppSessionFieldsForApprovedChain(Chain.Polygon)).toEqual({
      authorizedChains: [Chain.Polygon],
      selectedEVMChainId: getEvmChainId(Chain.Polygon),
    })
  })

  it('deduplicates a multi-chain approval while selecting the requested chain', () => {
    expect(
      getAppSessionFieldsForApprovedChains({
        chains: [Chain.Cosmos, Chain.Polygon, Chain.Cosmos],
        selectedChain: Chain.Polygon,
      })
    ).toEqual({
      authorizedChains: [Chain.Cosmos, Chain.Polygon],
      selectedEVMChainId: getEvmChainId(Chain.Polygon),
    })
  })

  it('rejects an unapproved EVM chain when explicit chain permissions exist', () => {
    expect(
      isAppSessionAuthorizedForChain({
        appSession: {
          host: 'example.com',
          url: 'https://example.com',
          authorizedChains: [Chain.Ethereum],
          selectedEVMChainId: getEvmChainId(Chain.Ethereum),
        },
        chain: Chain.Polygon,
      })
    ).toBe(false)
  })

  it('accepts the selected EVM chain for legacy sessions without explicit permissions', () => {
    expect(
      isAppSessionAuthorizedForChain({
        appSession: {
          host: 'example.com',
          url: 'https://example.com',
          selectedEVMChainId: getEvmChainId(Chain.Ethereum),
        },
        chain: Chain.Ethereum,
      })
    ).toBe(true)
  })

  it('keeps legacy account sessions authorized even without selected chain metadata', () => {
    const appSession = {
      host: 'example.com',
      url: 'https://example.com',
    }

    expect(
      isAppSessionAuthorizedForChain({
        appSession,
        chain: Chain.Polygon,
      })
    ).toBe(true)
    expect(isAppSessionAuthorizedForAccounts(appSession)).toBe(true)
  })

  it('keeps chain approval separate from account approval', () => {
    expect(
      isAppSessionAuthorizedForAccounts({
        host: 'example.com',
        url: 'https://example.com',
        authorizedChains: [Chain.Polygon],
        isAccountAccessGranted: false,
      })
    ).toBe(false)
  })
})
