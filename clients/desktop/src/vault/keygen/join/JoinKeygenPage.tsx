import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { MpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { JoinKeygenSessionStep } from '../shared/JoinKeygenSessionStep'
import { CurrentKeygenTypeProvider } from '../state/currentKeygenType'
import { JoinKeygenPeersStep } from './JoinKeygenPeersStep'
import { JoinKeygenProcess } from './JoinKeygenProcess'
import { JoinKeygenVaultProvider } from './JoinKeygenVaultProvider'
import { KeygenServerUrlProvider } from './KeygenServerUrlProvider'

const keygenSteps = ['session', 'keygen'] as const

export const JoinKeygenPage = () => {
  const { keygenType, keygenMsg } = useAppPathState<'joinKeygen'>()

  const { sessionId, useVultisigRelay, serviceName, encryptionKeyHex } =
    keygenMsg

  const serverType = useVultisigRelay ? 'relay' : 'local'

  const { step, toNextStep } = useStepNavigation({
    steps: keygenSteps,
    onExit: useNavigateBack(),
  })

  const { t } = useTranslation()

  const title = match(keygenType, {
    create: () => t('join_keygen'),
    reshare: () => t('join_reshare'),
    migrate: () => t('join_upgrade'),
  })

  return (
    <IsInitiatingDeviceProvider value={false}>
      <MpcServiceNameProvider value={serviceName}>
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
      </MpcServiceNameProvider>
    </IsInitiatingDeviceProvider>
  )
}
