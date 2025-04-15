import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { SecureMigrateVaultPage } from '../reshare/secure/SecureMigrateVaultPage'
import { FastMigrateVaultPage } from './fast/FastMigrateVaultPage'
import { MigrateIntro } from './MigrateIntro'

export const MigrateVaultPage = () => {
  const securityType = useCurrentVaultSecurityType()

  return (
    <StepTransition
      from={({ onFinish }) => <MigrateIntro onFinish={onFinish} />}
      to={() => (
        <Match
          value={securityType}
          fast={() => <FastMigrateVaultPage />}
          secure={() => <SecureMigrateVaultPage />}
        />
      )}
    />
  )
}
