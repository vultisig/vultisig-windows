import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { StepTransition } from '../../lib/ui/base/StepTransition'
import { Animation } from '../../ui/animations/Animation'
import { FlowPageHeader } from '../../ui/flow/FlowPageHeader'

export const MigrateIntro = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  return (
    <>
      <FlowPageHeader title={t('upgrade_vault')} />
      <StepTransition
        from={({ onForward }) => (
          <>
            <Animation value="upgrade/upgrade" />
            <button onClick={onForward}>Forward</button>
          </>
        )}
        to={() => (
          <>
            <Animation value="upgrade/all_devices" />
            <button onClick={onFinish}>Forward</button>
          </>
        )}
      />
    </>
  )
}
