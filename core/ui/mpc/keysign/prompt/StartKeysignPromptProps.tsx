import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'

import { CoreViewState } from '../../../navigation/CoreView'

type BaseStartKeysignPromptProps = Omit<
  CoreViewState<'keysign'>,
  'securityType' | 'keysignPayload'
>

export type StartKeysignPromptProps = BaseStartKeysignPromptProps & {
  /** Present once the payload is ready; its absence disables the button. */
  keysignPayload?: CoreViewState<'keysign'>['keysignPayload']
  /** Why the button is disabled, when it is. */
  disabledMessage?: string
  /**
   * Rebuilds the payload at the moment signing starts, so the builder's
   * fail-closed gates run now rather than when the verify screen mounted.
   * Resolves to the payload to sign, or `null` when the rebuild failed — in
   * which case the ceremony is abandoned rather than started with the payload
   * the screen was already holding.
   */
  onBeforeStart?: () => Promise<KeysignMessagePayload | null>
}
