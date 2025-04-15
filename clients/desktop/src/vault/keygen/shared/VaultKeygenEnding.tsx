import { useCurrentKeygenType } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { MigrateSuccess } from '../../migrate/MigrateSuccess'
import { VaultKeygenBackupFlow } from './VaultKeygenBackupFlow'

export const VaultKeygenEnding = () => {
  const keygenType = useCurrentKeygenType()

  const navigate = useAppNavigate()

  if (keygenType === 'migrate') {
    return (
      <StepTransition
        from={({ onFinish }) => <VaultKeygenBackupFlow onFinish={onFinish} />}
        to={() => <MigrateSuccess />}
      />
    )
  }

  return <VaultKeygenBackupFlow onFinish={() => navigate('vault')} />
}
