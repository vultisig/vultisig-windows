import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { PreviewInfo } from '@core/ui/mpc/keygen/reshare/plugin/PreviewInfo'
import { WaitForPluginAndVerifier } from '@core/ui/mpc/keygen/reshare/plugin/WaitForPluginAndVerifier'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { Plugin } from '@core/ui/plugins/core/get'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { Button } from '@lib/ui/buttons/Button'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { GradientText, Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

const steps = ['info', 'password', 'keygen'] as const

export const PluginReshareFlow = ({ plugin }: { plugin: Plugin }) => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })

  return (
    <Match
      value={step}
      info={() => <PreviewInfo value={plugin} onFinish={toNextStep} />}
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
