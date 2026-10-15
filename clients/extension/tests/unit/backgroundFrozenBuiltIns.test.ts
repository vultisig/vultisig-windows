import { Chain } from '@vultisig/core-chain/Chain'
import { encodeFunctionData, encodeFunctionResult, erc20Abi } from 'viem'
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

  // Regression test for #5147: `wallet_watchAsset` asks the background for the
  // token's symbol and decimals before it opens the approval popup. The SDK
  // resolver builds viem's public client, so under the freeze the request
  // rejected with the same "read only property 'call'" error and no popup
  // ever opened.
  it('resolves ERC-20 metadata for wallet_watchAsset', async () => {
    const { getTokenMetadata } =
      await import('@core/inpage-provider/background/resolvers/getTokenMetadata')

    const uni = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    const symbolCall = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'symbol',
    })

    vi.stubGlobal('fetch', async (_url: unknown, init: RequestInit) => {
      const { id, params } = JSON.parse(String(init.body))
      const [{ data }] = params
      const result =
        data === symbolCall
          ? encodeFunctionResult({
              abi: erc20Abi,
              functionName: 'symbol',
              result: 'UNI',
            })
          : encodeFunctionResult({
              abi: erc20Abi,
              functionName: 'decimals',
              result: 18,
            })

      return Response.json({ jsonrpc: '2.0', id, result })
    })
    freezeBuiltIns()

    const outcome = await getTokenMetadata({
      context: { requestOrigin: 'https://example.com' },
      input: { chain: Chain.Ethereum, id: uni },
    }).catch((error: unknown) => `failed: ${String(error)}`)

    expect(outcome).toEqual({ ticker: 'UNI', decimals: 18 })
  })
})
