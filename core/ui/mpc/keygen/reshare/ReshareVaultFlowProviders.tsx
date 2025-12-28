import {
  CurrentHexEncryptionKeyProvider,
  ExternalEncryptionKeyProvider,
  GeneratedHexEncryptionKeyProvider,
} from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import {
  ExternalSessionIdProvider,
  GeneratedMpcSessionIdProvider,
  MpcSessionIdProvider,
} from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'

import { CurrentVaultHexChainCodeProvider } from '../../state/currentHexChainCode'
import { CurrentVaultLocalPartyIdProvider } from '../../state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '../../state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '../../state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '../../state/mpcServiceName'
import { ServerUrlDerivedFromServerTypeProvider } from '../../state/serverUrlDerivedFromServerType'
import { CurrentKeygenVaultProvider } from '../state/keygenVault'
import { DklsInboundSequenceNoProvider } from './state/dklsInboundSequenceNo'

type ReshareVaultFlowProvidersProps = ChildrenProp & {
  externalEncryptionKey?: string | null
  externalSessionId?: string | null
}

const EncryptionKeyProviderWrapper = ({
  children,
  externalEncryptionKey,
}: ChildrenProp & { externalEncryptionKey?: string | null }) => {
  if (externalEncryptionKey !== undefined && externalEncryptionKey !== null) {
    return (
      <ExternalEncryptionKeyProvider value={externalEncryptionKey}>
        <CurrentHexEncryptionKeyProvider value={externalEncryptionKey}>
          {children}
        </CurrentHexEncryptionKeyProvider>
      </ExternalEncryptionKeyProvider>
    )
  }
  return (
    <GeneratedHexEncryptionKeyProvider>
      {children}
    </GeneratedHexEncryptionKeyProvider>
  )
}

const SessionIdProviderWrapper = ({
  children,
  externalSessionId,
}: ChildrenProp & { externalSessionId?: string | null }) => {
  if (externalSessionId !== undefined && externalSessionId !== null) {
    return (
      <ExternalSessionIdProvider value={externalSessionId}>
        <MpcSessionIdProvider value={externalSessionId}>
          {children}
        </MpcSessionIdProvider>
      </ExternalSessionIdProvider>
    )
  }
  return (
    <GeneratedMpcSessionIdProvider>{children}</GeneratedMpcSessionIdProvider>
  )
}

export const ReshareVaultFlowProviders = ({
  children,
  externalEncryptionKey,
  externalSessionId,
}: ReshareVaultFlowProvidersProps) => {
  return (
    <SessionIdProviderWrapper externalSessionId={externalSessionId}>
      <EncryptionKeyProviderWrapper
        externalEncryptionKey={externalEncryptionKey}
      >
        <DklsInboundSequenceNoProvider initialValue={0}>
          <CurrentKeygenVaultProvider>
            <CurrentVaultLocalPartyIdProvider>
              <MpcServerTypeProvider initialValue="relay">
                <ServerUrlDerivedFromServerTypeProvider>
                  <CurrentVaultHexChainCodeProvider>
                    <IsInitiatingDeviceProvider value={true}>
                      <GeneratedMpcServiceNameProvider>
                        <MpcPeersSelectionProvider>
                          {children}
                        </MpcPeersSelectionProvider>
                      </GeneratedMpcServiceNameProvider>
                    </IsInitiatingDeviceProvider>
                  </CurrentVaultHexChainCodeProvider>
                </ServerUrlDerivedFromServerTypeProvider>
              </MpcServerTypeProvider>
            </CurrentVaultLocalPartyIdProvider>
          </CurrentKeygenVaultProvider>
        </DklsInboundSequenceNoProvider>
      </EncryptionKeyProviderWrapper>
    </SessionIdProviderWrapper>
  )
}
