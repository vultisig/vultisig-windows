import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/reshare/plugin/KeygenFlow'
import { PolicyReview } from '@core/ui/mpc/keygen/reshare/plugin/PolicyReview'
import { PreviewInfo } from '@core/ui/mpc/keygen/reshare/plugin/PreviewInfo'
import { WaitForServer } from '@core/ui/mpc/keygen/reshare/plugin/WaitForServer'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

const steps = ['info', 'policy', 'password', 'keygen'] as const

export const PluginReshareFlow = () => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })

  return (
    <Match
      value={step}
      info={() => <PreviewInfo name="" onFinish={toNextStep} />}
      policy={() => (
        <PolicyReview onBack={toPreviousStep} onFinish={toNextStep} />
      )}
      password={() => (
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
              <PluginReshareFastKeygenServerActionProvider>
                <FastKeygenServerActionStep onFinish={toNextStep} />
              </PluginReshareFastKeygenServerActionProvider>
            </PasswordProvider>
          )}
        />
      )}
      keygen={() => (
        <>
          <PageHeader title={t('installing_plugin')} hasBorder />
          <ValueTransfer<string[]>
            from={({ onFinish }) => <WaitForServer onFinish={onFinish} />}
            to={({ value }) => (
              <MpcPeersProvider value={value}>
                <StartMpcSessionFlow
                  render={() => <KeygenFlow />}
                  value="keygen"
                  isPluginReshare
                />
              </MpcPeersProvider>
            )}
          />
        </>
      )}
    />
  )
}
