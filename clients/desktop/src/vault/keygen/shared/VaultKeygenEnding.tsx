import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { MigrateSuccess } from '../../migrate/MigrateSuccess'
import { useCurrentKeygenType } from '../state/currentKeygenType'
import { VaultKeygenBackupFlow } from './VaultKeygenBackupFlow'

export const VaultKeygenEnding = () => {
  const keygenType = useCurrentKeygenType()

  const navigate = useAppNavigate()

  if (keygenType === KeygenType.Migrate) {
    return (
      <StepTransition
        from={({ onForward }) => <VaultKeygenBackupFlow onFinish={onForward} />}
        to={() => <MigrateSuccess />}
      />
    )
  }

  return <VaultKeygenBackupFlow onFinish={() => navigate('vault')} />
}
