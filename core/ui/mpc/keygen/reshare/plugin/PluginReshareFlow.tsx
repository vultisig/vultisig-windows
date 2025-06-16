import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeygenFlow } from '@core/ui/mpc/keygen/fast/FastKeygenFlow'
import { PluginInfoStep } from '@core/ui/mpc/keygen/reshare/plugin/PluginInfoStep'
import { PluginPolicyStep } from '@core/ui/mpc/keygen/reshare/plugin/PluginPolicyStep'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useTranslation } from 'react-i18next'

const steps = ['info', 'policy', 'keygen'] as const

export const PluginReshareFlow = () => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })

  return (
    <Match
      value={step}
      info={() => <PluginInfoStep name="" onNext={toNextStep} />}
      policy={() => (
        <PluginPolicyStep onBack={toPreviousStep} onNext={toNextStep} />
      )}
      keygen={() => (
        <ValueTransfer<{ password: string }>
          key="password"
          from={({ onFinish }) => (
            <ServerPasswordStep
              description={t('plugin_password_desc')}
              onBack={toPreviousStep}
              onFinish={onFinish}
            />
          )}
          to={({ value: { password } }) => (
            <PasswordProvider initialValue={password}>
              <FastKeygenFlow onBack={toPreviousStep} />
            </PasswordProvider>
          )}
        />
      )}
    />
  )
}
