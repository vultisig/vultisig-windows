import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'
import { PluginReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/PluginReshareFastKeygenServerActionProvider'
import { useDklsInboundSequenceNoState } from '@core/ui/mpc/keygen/reshare/state/dklsInboundSequenceNo'
import { SilentStartMpcSessionFlow } from '@core/ui/mpc/session/SilentStartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { Plugin } from '@core/ui/plugins/core/get'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { KeygenFlow } from '../../flow/KeygenFlow'
import { WaitForPluginAndVerifier } from './WaitForPluginAndVerifier'

const steps = ['confirmation', 'keygen'] as const
const appInstallTotalSequenceNo = 12

type PluginReshareFlowStepsProps = {
  password: string
  plugin: Plugin
  onFinish: () => void | Promise<void>
  onTimeout?: () => void
  retryNumber: number
}

export const PluginReshareFlowSteps = ({
  password,
  plugin,
  onFinish,
  onTimeout,
  retryNumber,
}: PluginReshareFlowStepsProps) => {
  const { t } = useTranslation()
  const { step, toPreviousStep, toNextStep } = useStepNavigation({ steps })
  const [dklsInboundSequenceNo] = useDklsInboundSequenceNoState()

  return (
    <Match
      value={step}
      confirmation={() => (
        <PluginReshareFastKeygenServerActionProvider pluginId={plugin.id}>
          <FastKeygenServerActionStep onFinish={toNextStep} />
        </PluginReshareFastKeygenServerActionProvider>
      )}
      keygen={() => (
        <ValueTransfer<string[]>
          from={({ onFinish: onFromFinish }) => (
            <WaitForPluginAndVerifier onFinish={onFromFinish} />
          )}
          to={({ value }) => (
            <MpcPeersProvider value={value}>
              <SilentStartMpcSessionFlow
                render={() => (
                  <VStack gap={8} padding={16}>
                    {retryNumber > 0 && (
                      <Text color="shy" size={14} centerHorizontally>
                        {t('retry_plugin_installation', { retryNumber })},
                      </Text>
                    )}
                    <Text color="shy" size={14} centerHorizontally>
                      {t('installation_progress', {
                        progress:
                          dklsInboundSequenceNo !== 0
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
                    <KeygenFlow
                      onTimeout={onTimeout}
                      onBack={toPreviousStep}
                      onFinish={onFinish}
                      password={password}
                    />
                  </VStack>
                )}
              />
            </MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
