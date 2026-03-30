import type { SignatureAlgorithmWithMldsa } from '@core/ui/utils/getSignatureAlgorithm'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'

type KeysignActionInput = {
  msgs: string[]
  signatureAlgorithm: SignatureAlgorithmWithMldsa
  coinType: CoinType
  chain: Chain
}

export type KeysignAction = (
  input: KeysignActionInput
) => Promise<KeysignSignature[]>

export const [KeysignActionProvider, useKeysignAction] =
  setupValueProvider<KeysignAction>('KeysignAction')
