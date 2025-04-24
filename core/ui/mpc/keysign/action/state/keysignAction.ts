import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'

type KeysignActionInput = {
  msgs: string[]
  signatureAlgorithm: SignatureAlgorithm
  coinType: CoinType
}

export type KeysignAction = (
  input: KeysignActionInput
) => Promise<KeysignSignature[]>

export const { useValue: useKeysignAction, provider: KeysignActionProvider } =
  getValueProviderSetup<KeysignAction>('KeysignAction')
