import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import type { SignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'

/**
 * How many of a keysign's messages have a finished signature so far, out of
 * all the messages it signs. Counts are absolute, so a late or repeated report
 * never needs to be added up.
 */
export type KeysignProgress = {
  done: number
  total: number
}

type KeysignActionInput = {
  msgs: string[]
  signatureAlgorithm: SignatureAlgorithm
  coinType: CoinType
  chain: Chain
  /**
   * Called before the first message is signed and again after each one.
   * Implementations that sign every message in a single round may never call
   * it.
   */
  onProgress?: (progress: KeysignProgress) => void
}

/**
 * Signs every message in `msgs` through an MPC round with the other
 * signers, returning one signature per message.
 */
export type KeysignAction = (
  input: KeysignActionInput
) => Promise<KeysignSignature[]>

export const [KeysignActionProvider, useKeysignAction] =
  setupValueProvider<KeysignAction>('KeysignAction')
