import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { PreviewInfo } from '@core/ui/mpc/keygen/reshare/plugin/PreviewInfo'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'

import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { useTranslation } from 'react-i18next'

import { KeygenFlow } from '../../flow/KeygenFlow'
import { InstallPluginPendingState } from './InstallPluginPendingState'
import {
  PluginInstallAnimationProvider,
  usePluginInstallAnimation,
} from './PluginInstallAnimationProvider'
import { WaitForPluginAndVerifier } from './WaitForPluginAndVerifier'
import { useCallback } from 'react'

const steps = ['info', 'password', 'keygen'] as const
const closePopupDelay = 1200
const PluginReshareFlowContent = ({
  description,
  name,
}: {
  description: string
  name: string
}) => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })
  const animationContext = usePluginInstallAnimation()

  const onFinish = useCallback(async () => {
    if (animationContext) {
      animationContext.setCurrentStep('finishInstallation')
      await new Promise(resolve => setTimeout(resolve, closePopupDelay))
      window.close()
    }
  }, [animationContext])

  return (
    <>
      <InstallPluginPendingState />
      <Match
        value={step}
        info={() => (
          <PreviewInfo value={{ description, name }} onFinish={toNextStep} />
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
          <ValueTransfer<string[]>
            from={({ onFinish }) => (
              <WaitForPluginAndVerifier onFinish={onFinish} />
            )}
            to={({ value }) => (
              <MpcPeersProvider value={value}>
                <StartMpcSessionFlow
                  hidden={true}
                  render={() => (
                    <KeygenFlow onBack={toPreviousStep} onFinish={onFinish} />
                  )}
                  value="keygen"
                />
              </MpcPeersProvider>
            )}
          />
        )}
      />
    </>
  )
}

export const PluginReshareFlow = ({
  description,
  name,
}: {
  description: string
  name: string
}) => {
  return (
    <PluginInstallAnimationProvider>
      <PluginReshareFlowContent description={description} name={name} />
    </PluginInstallAnimationProvider>
  )
}
