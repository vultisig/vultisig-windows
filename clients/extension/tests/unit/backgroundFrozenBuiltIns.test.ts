import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@core/inpage-provider/background/resolvers/getAppChain', () => ({
  getAppChain: async () => Chain.Ethereum,
}))

// Mirrors the prototype lockdown `initExtensionBackground` applies when the
// service worker starts. Freezing is irreversible, so this file relies on
// vitest's per-file isolation to keep it from leaking into other tests.
const freezeBuiltIns = () =>
  [
    Object,
    Object.prototype,
    Function,
    Function.prototype,
    Array,
    Array.prototype,
    String,
    String.prototype,
    Number,
    Number.prototype,
    Boolean,
    Boolean.prototype,
  ].forEach(Object.freeze)

describe('background with frozen built-ins', () => {
  // Regression test for #5076: with the built-ins frozen, `evmClientRequest`
  // throws "Cannot assign to read only property 'call'" while building viem's
  // public client, so every dApp EVM read fails with "Internal error".
  it('serves a dApp eth_blockNumber request', async () => {
    const { evmClientRequest } =
      await import('@core/inpage-provider/background/resolvers/evmClientRequest')

    // A plain stub: vi.fn() records calls by assigning to objects the freeze
    // has locked.
    vi.stubGlobal('fetch', async () =>
      Response.json({ jsonrpc: '2.0', id: 1, result: '0x18e2337' })
    )
    freezeBuiltIns()

    const outcome = await evmClientRequest({
      context: { requestOrigin: 'https://example.com' },
      input: { method: 'eth_blockNumber' },
    }).catch((error: unknown) => `failed: ${String(error)}`)

    expect(outcome).toBe('0x18e2337')
  })
})
