import { Chain } from '@vultisig/core-chain/Chain'
import { getEvmChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { describe, expect, it } from 'vitest'

import {
  getAppSessionFieldsForApprovedChains,
  isAppSessionAuthorizedForAccounts,
  isAppSessionAuthorizedForChain,
} from './appSessionChainAuthorization'

describe('app session chain authorization', () => {
  it('marks an approved EVM chain as both authorized and selected', () => {
    expect(
      getAppSessionFieldsForApprovedChains({
        chains: [Chain.Polygon],
        selectedChain: Chain.Polygon,
      })
    ).toEqual({
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

  it('authorizes any chain for a connected origin regardless of recorded chain permissions', () => {
    // A stored session only exists for an already-connected origin, so we no
    // longer gate on `authorizedChains` — a multi-chain dApp attaches extra
    // chains to the same session without a fresh popup. Unconnected origins
    // are rejected upstream by `authorizeContext`, preserving #4214.
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
    ).toBe(true)
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

  it('does not treat a chainless denied session as legacy authorized', () => {
    expect(
      isAppSessionAuthorizedForChain({
        appSession: {
          host: 'example.com',
          url: 'https://example.com',
          isAccountAccessGranted: false,
        },
        chain: Chain.Polygon,
      })
    ).toBe(false)
  })
})
