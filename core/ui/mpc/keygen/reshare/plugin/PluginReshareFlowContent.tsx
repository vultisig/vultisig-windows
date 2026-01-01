import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { PreviewInfo } from '@core/ui/mpc/keygen/reshare/plugin/PreviewInfo'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { useDklsInboundSequenceNoState } from '@core/ui/mpc/keygen/reshare/state/dklsInboundSequenceNo'
import { SilentStartMpcSessionFlow } from '@core/ui/mpc/session/SilentStartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { Plugin } from '@core/ui/plugins/core/get'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { KeygenFlow } from '../../flow/KeygenFlow'
import { InstallPluginPendingState } from './InstallPluginPendingState'
import { usePluginInstallAnimation } from './PluginInstallAnimationProvider'
import { WaitForPluginAndVerifier } from './WaitForPluginAndVerifier'

const steps = ['confirmation', 'keygen'] as const
const closePopupDelay = 1200
const appInstallTotalSequenceNo = 12

export const PluginReshareFlowContent = ({
  plugin,
  onFinish: onFinishProp,
}: { plugin: Plugin } & OnFinishProp<boolean>) => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })
  const animationContext = usePluginInstallAnimation()
  const [dklsInboundSequenceNo] = useDklsInboundSequenceNoState()

  const onFinish = useCallback(async () => {
    const context = shouldBePresent(animationContext)
    context.setCurrentStep('finishInstallation')
    await new Promise(resolve => setTimeout(resolve, closePopupDelay))
    onFinishProp(true)
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
                    <VStack gap={8} padding={16}>
                      <Text color="shy" size={14} centerHorizontally>
                        {t('installation_progress', {
                          progress:
                            dklsInboundSequenceNo != 0
                              ? Number(
                                  (
                                    (dklsInboundSequenceNo /
                                      appInstallTotalSequenceNo) *
                                    100
                                  ).toFixed(0)
                                )
                              : 0,
                        })}
                      </Text>
                      <KeygenFlow onBack={toPreviousStep} onFinish={onFinish} />
                    </VStack>
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
