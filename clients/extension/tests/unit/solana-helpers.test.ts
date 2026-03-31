import { describe, expect, it } from 'vitest'

import type { IdentifierString } from '@wallet-standard/base'

import { isSolanaChain } from '@clients/extension/src/inpage/providers/solana/chains'
import { createSolanaSignInMessage } from '@clients/extension/src/inpage/providers/solana/signIn'

describe('createSolanaSignInMessage', () => {
  const minimalInput = {
    domain: 'example.com',
    address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
  }

  it('creates message with minimal input (domain + address only)', () => {
    const message = createSolanaSignInMessage(minimalInput)
    expect(message).toBe(
      'example.com wants you to sign in with your Solana account:\nHN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'
    )
  })

  it('creates message with all fields populated', () => {
    const fullInput = {
      domain: 'dapp.example.com',
      address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      statement: 'Sign in to access your account',
      uri: 'https://dapp.example.com',
      version: '1',
      chainId: 'mainnet',
      nonce: 'abc123',
      issuedAt: '2024-01-01T00:00:00Z',
      expirationTime: '2024-01-02T00:00:00Z',
      notBefore: '2024-01-01T00:00:00Z',
      requestId: 'req-123',
      resources: ['https://resource1.com', 'https://resource2.com'],
    }

    const message = createSolanaSignInMessage(fullInput)

    expect(message).toContain('dapp.example.com wants you to sign in')
    expect(message).toContain('\n\nSign in to access your account')
    expect(message).toContain('\n\nURI: https://dapp.example.com')
    expect(message).toContain('\nVersion: 1')
    expect(message).toContain('\nChain ID: mainnet')
    expect(message).toContain('\nNonce: abc123')
    expect(message).toContain('\nIssued At: 2024-01-01T00:00:00Z')
    expect(message).toContain('\nExpiration Time: 2024-01-02T00:00:00Z')
    expect(message).toContain('\nNot Before: 2024-01-01T00:00:00Z')
    expect(message).toContain('\nRequest ID: req-123')
    expect(message).toContain('\nResources:')
    expect(message).toContain('\n- https://resource1.com')
    expect(message).toContain('\n- https://resource2.com')
  })

  it('adds statement with double newline separator', () => {
    const input = {
      ...minimalInput,
      statement: 'Please sign this message',
    }
    const message = createSolanaSignInMessage(input)
    expect(message).toContain('\n\nPlease sign this message')
  })

  it('renders resources as bullet list', () => {
    const input = {
      ...minimalInput,
      resources: ['https://api.example.com/auth'],
    }
    const message = createSolanaSignInMessage(input)
    expect(message).toContain('\nResources:\n- https://api.example.com/auth')
  })

  it('renders multiple resources all appear', () => {
    const input = {
      ...minimalInput,
      resources: [
        'https://resource1.com',
        'https://resource2.com',
        'https://resource3.com',
      ],
    }
    const message = createSolanaSignInMessage(input)
    expect(message).toContain('- https://resource1.com')
    expect(message).toContain('- https://resource2.com')
    expect(message).toContain('- https://resource3.com')
  })

  it('omits resources section for empty array', () => {
    const input = {
      ...minimalInput,
      resources: [],
    }
    const message = createSolanaSignInMessage(input)
    expect(message).not.toContain('Resources:')
  })

  it('handles only some optional fields (uri + nonce but no version)', () => {
    const input = {
      ...minimalInput,
      uri: 'https://example.com',
      nonce: 'xyz789',
    }
    const message = createSolanaSignInMessage(input)
    expect(message).toContain('\n\nURI: https://example.com')
    expect(message).toContain('\nNonce: xyz789')
    expect(message).not.toContain('Version:')
  })

  it('handles URI appearing after statement when both present', () => {
    const input = {
      ...minimalInput,
      statement: 'My statement',
      uri: 'https://example.com',
    }
    const message = createSolanaSignInMessage(input)
    // Statement adds \n\n, then URI adds another \n\n
    expect(message).toContain('\n\nMy statement\n\nURI: https://example.com')
  })
})

describe('isSolanaChain', () => {
  it('returns true for solana:mainnet', () => {
    expect(isSolanaChain('solana:mainnet')).toBe(true)
  })

  it('returns false for solana:devnet', () => {
    expect(isSolanaChain('solana:devnet')).toBe(false)
  })

  it('returns false for ethereum:mainnet', () => {
    expect(isSolanaChain('ethereum:mainnet')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isSolanaChain('' as IdentifierString)).toBe(false)
  })

  it('returns false for random string', () => {
    expect(isSolanaChain('random:chain:id')).toBe(false)
  })

  it('returns false for partial match', () => {
    expect(isSolanaChain('solana' as IdentifierString)).toBe(false)
  })

  it('returns false for mainnet without prefix', () => {
    expect(isSolanaChain('mainnet' as IdentifierString)).toBe(false)
  })
})
