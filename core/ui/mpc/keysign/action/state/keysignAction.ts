import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import type { SignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'

type KeysignActionInput = {
  msgs: string[]
  signatureAlgorithm: SignatureAlgorithm
  coinType: CoinType
  chain: Chain
}

export type KeysignAction = (
  input: KeysignActionInput
) => Promise<KeysignSignature[]>

export const [KeysignActionProvider, useKeysignAction] =
  setupValueProvider<KeysignAction>('KeysignAction')
