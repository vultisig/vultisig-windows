import { fromLibType } from '@core/communication/utils/libType'
import { match } from '@lib/utils/match'
import { makeRecord } from '@lib/utils/record/makeRecord'
import { useTranslation } from 'react-i18next'

import { Match } from '../../../lib/ui/base/Match'
import { ValueTransfer } from '../../../lib/ui/base/ValueTransfer'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers'
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { KeygenType } from '../KeygenType'
import { JoinKeygenSessionStep } from '../shared/JoinKeygenSessionStep'
import { CurrentServiceNameProvider } from '../shared/state/currentServiceName'
import { CurrentSessionIdProvider } from '../shared/state/currentSessionId'
import { CurrentKeygenTypeProvider } from '../state/currentKeygenType'
import { CurrentServerTypeProvider } from '../state/currentServerType'
import { JoinKeygenProcess } from './JoinKeygenProcess'
import { JoinKeygenSignersStep } from './JoinKeygenSignersStep'
import { JoinKeygenVaultProvider } from './JoinKeygenVaultProvider'
import { KeygenServerUrlProvider } from './KeygenServerUrlProvider'

const keygenSteps = ['session', 'keygen'] as const

export const JoinKeygenPage = () => {
  const { keygenType, keygenMsg } = useAppPathState<'joinKeygen'>()

  const {
    sessionId,
    useVultisigRelay,
    serviceName,
    encryptionKeyHex,
    libType,
  } = keygenMsg

  const serverType = useVultisigRelay ? 'relay' : 'local'

  const { step, toNextStep } = useStepNavigation({
    steps: keygenSteps,
    onExit: useNavigateBack(),
  })

  const { t } = useTranslation()

  const title = match(keygenType, {
    [KeygenType.Keygen]: () => t('join_keygen'),
    [KeygenType.Reshare]: () => t('join_reshare'),
  })

  return (
    <IsInitiatingDeviceProvider value={false}>
      <MpcLibProvider value={fromLibType(libType)}>
        <CurrentServiceNameProvider value={serviceName}>
          <CurrentServerTypeProvider initialValue={serverType}>
            <CurrentSessionIdProvider value={sessionId}>
              <CurrentKeygenTypeProvider value={keygenType}>
                <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                  <JoinKeygenVaultProvider>
                    <KeygenServerUrlProvider>
                      <Match
                        value={step}
                        session={() => (
                          <JoinKeygenSessionStep onForward={toNextStep} />
                        )}
                        keygen={() => (
                          <ValueTransfer<{ peers: string[] }>
                            from={({ onFinish }) => (
                              <JoinKeygenSignersStep onFinish={onFinish} />
                            )}
                            to={({ value: { peers } }) => (
                              <PeersSelectionRecordProvider
                                initialValue={makeRecord(peers, () => true)}
                              >
                                <JoinKeygenProcess title={title} />
                              </PeersSelectionRecordProvider>
                            )}
                          />
                        )}
                      />
                    </KeygenServerUrlProvider>
                  </JoinKeygenVaultProvider>
                </CurrentHexEncryptionKeyProvider>
              </CurrentKeygenTypeProvider>
            </CurrentSessionIdProvider>
          </CurrentServerTypeProvider>
        </CurrentServiceNameProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
