import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { JoinKeysignPage } from '@clients/extension/src/mpc/keysign/join/JoinKeysignPage'

/**
 * Joins a keysign in an expanded tab, since the other device waits on this
 * one and the toolbar popup closes as soon as it loses focus.
 */
export const JoinKeysignView = () => (
  <ExpandViewGuard>
    <JoinKeysignPage />
  </ExpandViewGuard>
)
