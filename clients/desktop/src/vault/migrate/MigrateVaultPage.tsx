import { StepTransition } from '@lib/ui/base/StepTransition'

import { hasServerSigner } from '../fast/utils/hasServerSigner'
import { SecureMigrateVaultPage } from '../reshare/secure/SecureMigrateVaultPage'
import { useCurrentVault } from '../state/currentVault'
import { FastMigrateVaultPage } from './fast/FastMigrateVaultPage'
import { MigrateIntro } from './MigrateIntro'

export const MigrateVaultPage = () => {
  const { signers } = useCurrentVault()

  return (
    <StepTransition
      from={({ onForward }) => <MigrateIntro onFinish={onForward} />}
      to={() =>
        hasServerSigner(signers) ? (
          <FastMigrateVaultPage />
        ) : (
          <SecureMigrateVaultPage />
        )
      }
    />
  )
}
