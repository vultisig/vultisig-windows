import { JoinKeygenProviders } from '@core/ui/mpc/keygen/join/JoinKeygenProviders'
import { JoinMpcSessionStep } from '@core/ui/mpc/keygen/join/JoinMpcSessionStep'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { JoinKeygenActionProvider } from './JoinKeygenActionProvider'
import { JoinKeygenPeersStep } from './JoinKeygenPeersStep'
import { JoinKeygenProcess } from './JoinKeygenProcess'
import { JoinKeygenServerUrlProvider } from './JoinKeygenServerUrlProvider'

const keygenSteps = ['session', 'keygen'] as const

export const JoinKeygenPage = () => {
  const { keygenType } = useCorePathState<'joinKeygen'>()

  const onExit = useNavigateBack()

  const { step, toNextStep } = useStepNavigation({
    steps: keygenSteps,
    onExit,
  })

  const { t } = useTranslation()

  const title = match(keygenType, {
    create: () => t('join_keygen'),
    reshare: () => t('join_reshare'),
    migrate: () => t('join_upgrade'),
  })

  return (
    <JoinKeygenProviders>
      <JoinKeygenServerUrlProvider>
        <JoinKeygenActionProvider>
          <MpcMediatorManager />
          <Match
            value={step}
            session={() => <JoinMpcSessionStep onFinish={toNextStep} />}
            keygen={() => (
              <ValueTransfer<string[]>
                from={({ onFinish }) => (
                  <JoinKeygenPeersStep onFinish={onFinish} />
                )}
                to={({ value }) => (
                  <MpcPeersProvider value={value}>
                    <JoinKeygenProcess title={title} onBack={onExit} />
                  </MpcPeersProvider>
                )}
              />
            )}
          />
        </JoinKeygenActionProvider>
      </JoinKeygenServerUrlProvider>
    </JoinKeygenProviders>
  )
}
