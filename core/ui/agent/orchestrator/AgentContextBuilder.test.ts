import { describe, expect, it } from 'vitest'

import { buildMessageContext } from './AgentContextBuilder'

describe('buildMessageContext', () => {
  it('includes all vaults and address book entries in context', () => {
    const context = buildMessageContext({
      vaultPubKey: 'active-ecdsa',
      vaultName: 'Primary',
      coins: [
        {
          chain: 'solana',
          ticker: 'SOL',
          address: 'active-sol',
          isNativeToken: true,
          decimals: 9,
        },
        {
          chain: 'ethereum',
          ticker: 'USDC',
          address: 'active-eth',
          contractAddress: '0x-usdc',
          isNativeToken: false,
          decimals: 6,
        },
      ],
      addressBookItems: [
        {
          title: 'Alice',
          address: 'alice-sol',
          chain: 'solana',
        },
      ],
      allVaults: [
        {
          name: 'Primary',
          publicKeyEcdsa: 'active-ecdsa',
          publicKeyEddsa: 'active-eddsa',
          coins: [
            {
              chain: 'solana',
              ticker: 'SOL',
              address: 'active-sol',
              isNativeToken: true,
              decimals: 9,
            },
          ],
        },
        {
          name: 'Savings',
          publicKeyEcdsa: 'savings-ecdsa',
          publicKeyEddsa: 'savings-eddsa',
          coins: [
            {
              chain: 'bitcoin',
              ticker: 'BTC',
              address: 'savings-btc',
              isNativeToken: true,
              decimals: 8,
            },
            {
              chain: 'ethereum',
              ticker: 'USDC',
              address: 'savings-eth',
              contractAddress: '0x-usdc',
              isNativeToken: false,
              decimals: 6,
            },
          ],
        },
      ],
    })

    expect(context.addresses).toEqual({
      solana: 'active-sol',
    })

    expect(context.address_book).toEqual([
      {
        title: 'Alice',
        address: 'alice-sol',
        chain: 'solana',
      },
      {
        title: 'Primary',
        address: 'active-sol',
        chain: 'solana',
      },
      {
        title: 'Savings',
        address: 'savings-btc',
        chain: 'bitcoin',
      },
    ])

    expect(context.all_vaults).toEqual([
      {
        name: 'Primary',
        pubkey_ecdsa: 'active-ecdsa',
        pubkey_eddsa: 'active-eddsa',
        addresses: {
          solana: 'active-sol',
        },
      },
      {
        name: 'Savings',
        pubkey_ecdsa: 'savings-ecdsa',
        pubkey_eddsa: 'savings-eddsa',
        addresses: {
          bitcoin: 'savings-btc',
        },
      },
    ])
  })

  it('mirrors internal vault addresses into address_book without duplicates', () => {
    const context = buildMessageContext({
      vaultPubKey: 'active-ecdsa',
      vaultName: 'Primary',
      coins: [],
      addressBookItems: [
        {
          title: 'Primary',
          address: 'active-sol',
          chain: 'solana',
        },
      ],
      allVaults: [
        {
          name: 'Primary',
          publicKeyEcdsa: 'active-ecdsa',
          publicKeyEddsa: 'active-eddsa',
          coins: [
            {
              chain: 'solana',
              ticker: 'SOL',
              address: 'active-sol',
              isNativeToken: true,
              decimals: 9,
            },
          ],
        },
      ],
    })

    expect(context.address_book).toEqual([
      {
        title: 'Primary',
        address: 'active-sol',
        chain: 'solana',
      },
    ])
  })

  it('omits all_vaults when no vault data is provided', () => {
    const context = buildMessageContext({
      vaultPubKey: 'active-ecdsa',
      vaultName: 'Primary',
      coins: [],
    })

    expect(context.all_vaults).toBeUndefined()
  })

  it('includes empty address maps for vaults without native coins', () => {
    const context = buildMessageContext({
      vaultPubKey: 'active-ecdsa',
      vaultName: 'Primary',
      coins: [],
      allVaults: [
        {
          name: 'Tokens Only',
          publicKeyEcdsa: 'tokens-ecdsa',
          publicKeyEddsa: 'tokens-eddsa',
          coins: [
            {
              chain: 'ethereum',
              ticker: 'USDC',
              address: '0x-token-holder',
              contractAddress: '0x-usdc',
              isNativeToken: false,
              decimals: 6,
            },
          ],
        },
      ],
    })

    expect(context.all_vaults).toEqual([
      {
        name: 'Tokens Only',
        pubkey_ecdsa: 'tokens-ecdsa',
        pubkey_eddsa: 'tokens-eddsa',
        addresses: {},
      },
    ])
  })
})
