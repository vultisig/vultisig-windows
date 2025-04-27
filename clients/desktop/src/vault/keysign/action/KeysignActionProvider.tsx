import { KeysignActionProvider as DKLSKeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { ChildrenProp } from '@lib/ui/props'

import { LegacyKeysignActionProvider as GG20KeysignActionProvider } from './LegacyKeysignActionProvider'

export const KeysignActionProvider = ({ children }: ChildrenProp) => {
  const { libType } = useCurrentVault()

  return (
    <Match
      value={libType}
      DKLS={() => (
        <DKLSKeysignActionProvider>{children}</DKLSKeysignActionProvider>
      )}
      GG20={() => (
        <GG20KeysignActionProvider>{children}</GG20KeysignActionProvider>
      )}
    />
  )
}
