import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { fromLibType } from '@core/mpc/types/utils/libType'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { MpcPeersProvider } from '../../../mpc/peers/state/mpcPeers'
import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { MpcSessionIdProvider } from '../../../mpc/session/state/mpcSession'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { JoinKeygenSessionStep } from '../shared/JoinKeygenSessionStep'
import { CurrentServiceNameProvider } from '../shared/state/currentServiceName'
import { CurrentKeygenTypeProvider } from '../state/currentKeygenType'
import { JoinKeygenPeersStep } from './JoinKeygenPeersStep'
import { JoinKeygenProcess } from './JoinKeygenProcess'
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
    [KeygenType.Migrate]: () => t('join_upgrade'),
  })

  return (
    <IsInitiatingDeviceProvider value={false}>
      <MpcLibProvider value={fromLibType(libType)}>
        <CurrentServiceNameProvider value={serviceName}>
          <MpcServerTypeProvider initialValue={serverType}>
            <MpcSessionIdProvider value={sessionId}>
              <CurrentKeygenTypeProvider value={keygenType}>
                <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                  <JoinKeygenVaultProvider>
                    <KeygenServerUrlProvider>
                      <MpcMediatorManager />
                      <Match
                        value={step}
                        session={() => (
                          <JoinKeygenSessionStep onForward={toNextStep} />
                        )}
                        keygen={() => (
                          <ValueTransfer<string[]>
                            from={({ onFinish }) => (
                              <JoinKeygenPeersStep onFinish={onFinish} />
                            )}
                            to={({ value }) => (
                              <MpcPeersProvider value={value}>
                                <JoinKeygenProcess title={title} />
                              </MpcPeersProvider>
                            )}
                          />
                        )}
                      />
                    </KeygenServerUrlProvider>
                  </JoinKeygenVaultProvider>
                </CurrentHexEncryptionKeyProvider>
              </CurrentKeygenTypeProvider>
            </MpcSessionIdProvider>
          </MpcServerTypeProvider>
        </CurrentServiceNameProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
