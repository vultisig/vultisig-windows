import { MigrateSuccess } from '@core/ui/mpc/keygen/migrate/MigrateSuccess'
import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'

import { VaultKeygenBackupFlow } from './VaultKeygenBackupFlow'

// TODO: Remove this when @radzion migrates VaultKeygenEnding to core package
export const VaultKeygenEnding = ({ onBack }: OnBackProp) => {
  const keygenType = useCurrentKeygenType()

  const navigate = useCoreNavigate()

  if (keygenType === 'migrate') {
    return (
      <StepTransition
        from={({ onFinish }) => (
          <VaultKeygenBackupFlow onFinish={onFinish} onBack={onBack} />
        )}
        to={() => <MigrateSuccess />}
      />
    )
  }

  return (
    <VaultKeygenBackupFlow onFinish={() => navigate('vault')} onBack={onBack} />
  )
}
