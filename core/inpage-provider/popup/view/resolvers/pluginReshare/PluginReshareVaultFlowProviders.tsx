import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ExternalEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { ExternalSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ChildrenProp } from '@lib/ui/props'

type PluginReshareVaultFlowProvidersProps = ChildrenProp & {
  dAppSessionId: string
  encryptionKeyHex: string
}

export const PluginReshareVaultFlowProviders = ({
  children,
  dAppSessionId,
  encryptionKeyHex,
}: PluginReshareVaultFlowProvidersProps) => {
  return (
    <ExternalEncryptionKeyProvider value={encryptionKeyHex}>
      <ExternalSessionIdProvider value={dAppSessionId}>
        <ReshareVaultFlowProviders>{children}</ReshareVaultFlowProviders>
      </ExternalSessionIdProvider>
    </ExternalEncryptionKeyProvider>
  )
}
