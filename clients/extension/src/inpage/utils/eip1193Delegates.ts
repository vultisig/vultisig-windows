const delegatedMethods = [
  'request',
  'on',
  'removeListener',
  'isConnected',
] as const

type DelegatedMethod = (typeof delegatedMethods)[number]

type InstallEip1193DelegatesInput = {
  container: object
  evmProvider: Record<DelegatedMethod, (...args: never[]) => unknown>
}

/**
 * Adds the EIP-1193 surface (`request`, `on`, `removeListener`,
 * `isConnected`) to the multi-chain `window.vultisig` container, bound to
 * the EVM provider. Legacy integrations probe `window.<walletname>`
 * directly and assume it IS the provider; the delegates keep those flows
 * working while `window.vultisig.ethereum` stays the canonical provider.
 * Defined non-enumerable so consumers that iterate the container's keys
 * (the `window.xfi`-style chain-per-key pattern) keep seeing only chain
 * entries, and non-writable so dapp code can't clobber them.
 */
export const installEip1193Delegates = ({
  container,
  evmProvider,
}: InstallEip1193DelegatesInput) => {
  for (const method of delegatedMethods) {
    Object.defineProperty(container, method, {
      value: evmProvider[method].bind(evmProvider),
      enumerable: false,
    })
  }
}
