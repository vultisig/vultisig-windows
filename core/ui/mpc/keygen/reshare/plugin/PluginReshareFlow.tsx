import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { PreviewInfo } from '@core/ui/mpc/keygen/reshare/plugin/PreviewInfo'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { Button } from '@lib/ui/buttons/Button'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { GradientText, Text } from '@lib/ui/text'
import { NameProp } from '@lib/utils/entities/props'
import { useTranslation } from 'react-i18next'

import { KeygenFlow } from '../../flow/KeygenFlow'
import { WaitForPluginAndVerifier } from './WaitForPluginAndVerifier'

const steps = ['info', 'password', 'keygen'] as const

export const PluginReshareFlow = ({ name }: NameProp) => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })

  return (
    <Match
      value={step}
      info={() => <PreviewInfo value={name} onFinish={toNextStep} />}
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
            from={({ onFinish }) => (
              <WaitForPluginAndVerifier onFinish={onFinish} />
            )}
            to={({ value }) => (
              <StepTransition
                from={({ onFinish }) => (
                  <MpcPeersProvider value={value}>
                    <StartMpcSessionFlow
                      render={() => (
                        <KeygenFlow
                          onBack={toPreviousStep}
                          onFinish={onFinish}
                        />
                      )}
                      value="keygen"
                    />
                  </MpcPeersProvider>
                )}
                to={() => (
                  <>
                    <PageContent justifyContent="end">
                      <GradientText
                        as="span"
                        size={28}
                        weight={500}
                        centerHorizontally
                      >{`${t('success')}.`}</GradientText>
                      <Text as="span" size={28} weight={500} centerHorizontally>
                        {t('plugin_success_desc', { name })}
                      </Text>
                    </PageContent>
                    <PageFooter>
                      <Button onClick={() => window.close()}>
                        {t('go_to_wallet')}
                      </Button>
                    </PageFooter>
                  </>
                )}
              />
            )}
          />
        </>
      )}
    />
  )
}
