import { ChildrenProp, ValueProp } from '@lib/ui/props'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { KeygenOperation } from '@vultisig/core-mpc/keygen/KeygenOperation'

import { PasscodeAutoLockHold } from '../../../passcodeEncryption/autoLock/PasscodeAutoLockHold'

const [KeygenOperationValueProvider, useKeygenOperation] =
  setupValueProvider<KeygenOperation>('KeygenOperation')

export { useKeygenOperation }

/**
 * Marks the subtree as a keygen flow and, for as long as it is mounted, holds
 * the passcode auto-lock. A ceremony can sit for minutes waiting on peer
 * devices with no local interaction; if the auto-lock cleared the passcode in
 * that window, the completed key share could not be sealed and persisted —
 * and for a reshare the peers have already committed the new share set, so
 * discarding this device's share is unrecoverable (#4598).
 */
export const KeygenOperationProvider = ({
  value,
  children,
}: ValueProp<KeygenOperation> & ChildrenProp) => (
  <KeygenOperationValueProvider value={value}>
    <PasscodeAutoLockHold />
    {children}
  </KeygenOperationValueProvider>
)
