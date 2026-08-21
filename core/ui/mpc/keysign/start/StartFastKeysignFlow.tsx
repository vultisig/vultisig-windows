import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'
import { FastKeysignServerStep } from '@core/ui/mpc/keysign/fast/FastKeysignServerStep'
import { KeysignSigningState } from '@core/ui/mpc/keysign/flow/KeysignSigningState'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignActionProviderProp } from '@core/ui/mpc/keysign/start/KeysignActionProviderProp'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TransactionRecorderProvider } from '../../../transaction-history/record/TransactionRecorderProvider'
import { KeysignMessagePayloadProvider } from '../state/keysignMessagePayload'
import { SwapQuoteProvider } from '../state/swapQuote'

const keysignSteps = ['server', 'keysign'] as const

export const StartFastKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
}: KeysignActionProviderProp) => {
  const { goBack, version } = useCore()
  const { t } = useTranslation()
  const [{ keysignPayload, password, toAddressLabel, swapQuote }] =
    useCoreViewState<'keysign'>()
  const [isConnected, setIsConnected] = useState(false)
  const [showProgress, setShowProgress] = useState(true)
  const { step, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: goBack,
  })

  const renderPending = useCallback(() => null, [])
  const hideProgress = useCallback(() => setShowProgress(false), [])
  const syncProgressWithError = useCallback(
    (isError: boolean) => setShowProgress(!isError),
    []
  )
  const showSigningProgress = useCallback(() => setIsConnected(true), [])

  return (
    <KeysignMessagePayloadProvider value={keysignPayload}>
      {showProgress ? (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton />}
            title={t(isConnected ? 'keysign' : 'connecting_to_server')}
            hasBorder
          />
          <KeysignSigningState isConnected={isConnected} />
          <PageFooter alignItems="center">
            <Text color="shy" size={12}>
              {isConnected ? `${t('version')} ${version}` : '\u00a0'}
            </Text>
          </PageFooter>
        </>
      ) : null}
      <Match
        value={step}
        server={() => (
          <FastKeysignServerStep
            onError={hideProgress}
            onFinish={toNextStep}
            password={shouldBePresent(password)}
            renderPending={renderPending}
          />
        )}
        keysign={() => (
          <ValueTransfer<string[]>
            from={({ onFinish }) => (
              <WaitForServerStep
                onErrorChange={syncProgressWithError}
                onFinish={onFinish}
                renderPending={renderPending}
              />
            )}
            key="peers"
            to={({ value }) => (
              <MpcPeersProvider value={value}>
                <StartMpcSessionFlow
                  onError={hideProgress}
                  render={() => (
                    <KeysignActionProvider>
                      <SwapQuoteProvider value={swapQuote}>
                        <TransactionRecorderProvider>
                          <KeysignSigningStep
                            onSettled={hideProgress}
                            onStart={showSigningProgress}
                            renderPending={renderPending}
                            toAddressLabel={toAddressLabel}
                          />
                        </TransactionRecorderProvider>
                      </SwapQuoteProvider>
                    </KeysignActionProvider>
                  )}
                  renderPending={renderPending}
                  value="keysign"
                />
              </MpcPeersProvider>
            )}
          />
        )}
      />
    </KeysignMessagePayloadProvider>
  )
}
