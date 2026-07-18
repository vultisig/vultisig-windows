import { OtherChain } from '@vultisig/core-chain/Chain'

import { requestAccount } from '../core/requestAccount'
import { xrplMainnet } from './network'
import { signRippleMessage } from './signRippleMessage'
import { signRippleTransaction } from './signRippleTransaction'

const getRippleAccount = () => requestAccount(OtherChain.Ripple)

/**
 * Vultisig-native XRPL provider exposed at `window.vultisig.xrpl`.
 *
 * Mirrors the GemWallet-compatible adapter surface, but as a direct object API
 * a dApp can call without going through the `@gemwallet/api` postMessage
 * protocol. Method shapes match `@gemwallet/api` so GemWallet-aware dApps can
 * target either transport, and the returned values are the same `result`
 * payloads that transport hands back.
 *
 * Every vault-touching method routes through the same grant-access + keysign
 * popups as the postMessage bridge; a declined prompt rejects the returned
 * promise (there is no result-less "reject" shape on this object API).
 */
export const createXrplProvider = () => ({
  isInstalled: async (): Promise<boolean> => true,
  getNetwork: async () => xrplMainnet,
  getAddress: async () => {
    const { address } = await getRippleAccount()

    return { address }
  },
  getPublicKey: async () => {
    const { address, publicKey } = await getRippleAccount()

    // XRPL tooling emits account public keys as uppercase hex.
    return { address, publicKey: publicKey.toUpperCase() }
  },
  signMessage: async (message: string, isHex = false) => {
    const signedMessage = await signRippleMessage({ message, isHex })

    return { signedMessage }
  },
  signTransaction: async ({ transaction }: { transaction: unknown }) => {
    const { signature } = await signRippleTransaction({
      transaction,
      broadcast: false,
    })

    return { signature }
  },
  submitTransaction: async ({ transaction }: { transaction: unknown }) => {
    const { hash } = await signRippleTransaction({
      transaction,
      broadcast: true,
    })

    return { hash }
  },
})
