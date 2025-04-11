import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { SecureMigrateVaultPage } from '../reshare/secure/SecureMigrateVaultPage'
import { FastMigrateVaultPage } from './fast/FastMigrateVaultPage'
import { MigrateIntro } from './MigrateIntro'

export const MigrateVaultPage = () => {
  const { signers } = useCurrentVault()

  return (
    <StepTransition
      from={({ onForward }) => <MigrateIntro onFinish={onForward} />}
      to={() =>
        hasServer(signers) ? (
          <FastMigrateVaultPage />
        ) : (
          <SecureMigrateVaultPage />
        )
      }
    />
  )
}
