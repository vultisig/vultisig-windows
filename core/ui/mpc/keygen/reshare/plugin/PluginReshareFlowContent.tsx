import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { PreviewInfo } from '@core/ui/mpc/keygen/reshare/plugin/PreviewInfo'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { SilentStartMpcSessionFlow } from '@core/ui/mpc/session/SilentStartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { Plugin } from '@core/ui/plugins/core/get'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnFinishProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { KeygenFlow } from '../../flow/KeygenFlow'
import { InstallPluginPendingState } from './InstallPluginPendingState'
import { usePluginInstallAnimation } from './PluginInstallAnimationProvider'
import { WaitForPluginAndVerifier } from './WaitForPluginAndVerifier'

const steps = ['confirmation', 'keygen'] as const
const closePopupDelay = 1200

export const PluginReshareFlowContent = ({
  plugin,
  onFinish: onFinishProp,
}: { plugin: Plugin } & OnFinishProp<boolean>) => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })
  const animationContext = usePluginInstallAnimation()

  const onFinish = useCallback(async () => {
    if (animationContext) {
      animationContext.setCurrentStep('finishInstallation')
      await new Promise(resolve => setTimeout(resolve, closePopupDelay))
      onFinishProp(true)
    }
  }, [animationContext, onFinishProp])

  return (
    <>
      <InstallPluginPendingState />
      <Match
        value={step}
        confirmation={() => (
          <ValueTransfer<{ password: string }>
            key="password"
            from={({ onFinish }) => (
              <PreviewInfo value={plugin} onFinish={onFinish} />
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
                <SilentStartMpcSessionFlow
                  render={() => (
                    <KeygenFlow onBack={toPreviousStep} onFinish={onFinish} />
                  )}
                />
              </MpcPeersProvider>
            )}
          />
        )}
      />
    </>
  )
}
