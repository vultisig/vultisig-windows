import { Chain } from '@core/chain/Chain'
import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'

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
