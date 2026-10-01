import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

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
  // Documents #5076: viem's public client assigns `.call` onto functions, which
  // a frozen Function.prototype rejects. `evmClientRequest` and `getTx` build
  // their client with `getEvmClient`, so every dApp EVM read hits this and the
  // dApp only sees "Internal error". Flip this to expect a working client once
  // the background stops using the public client.
  it('cannot build the public EVM client', async () => {
    const { getEvmClient } =
      await import('@vultisig/core-chain/chains/evm/client')

    freezeBuiltIns()

    expect(() => getEvmClient(Chain.Ethereum)).toThrow(
      /Cannot assign to read only property 'call'/
    )
  })
})
