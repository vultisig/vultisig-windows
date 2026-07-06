import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'

import { ReshareVaultIntroStep } from './ReshareVaultIntroStep'
import { ReshareVaultWarningStep } from './ReshareVaultWarningStep'

const steps = ['intro', 'warning'] as const

export const ReshareVaultPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { goBack } = useCore()
  const securityType = useCurrentVaultSecurityType()
  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
    onExit: goBack,
  })

  return (
    <Match
      value={step}
      intro={() => (
        <ReshareVaultIntroStep
          onBack={goBack}
          onStartReshare={toNextStep}
          onJoinReshare={() =>
            navigate({ id: 'uploadQr', state: { title: t('join_reshare') } })
          }
        />
      )}
      warning={() => (
        <ReshareVaultWarningStep
          onBack={toPreviousStep}
          onConfirm={() =>
            match(securityType, {
              fast: () => navigate({ id: 'reshareVaultFast' }),
              secure: () => navigate({ id: 'reshareVaultSecure' }),
            })
          }
        />
      )}
    />
  )
}
