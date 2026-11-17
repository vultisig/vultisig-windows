import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { JoinKeygenPage } from '@clients/extension/src/mpc/keygen/join/JoinKeygenPage'

export const JoinKeygenView = () => (
  <ExpandViewGuard>
    <JoinKeygenPage />
  </ExpandViewGuard>
)
