import {
  PluginMetadata,
  PluginReshareFlow,
} from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { PluginJoinKeygenUrl } from './PluginJoinKeygenUrl'
import { useStoredPendingRequestQuery } from '../../utils/pendingRequests'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Match } from '@lib/ui/base/Match'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { List } from '@lib/ui/list'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { ListItem } from '@lib/ui/list/item'
import { base64Decode } from '@bufbuild/protobuf/wire'
import { PluginCreatePolicyProps } from '../../utils/interfaces'
import { fromBinary } from '@bufbuild/protobuf'
import { PolicySchema } from '../../types/gen/policy_pb'

export const PluginPage = () => {
  const requestQuery = useStoredPendingRequestQuery('plugin')
  const handleClose = (): void => {
    window.close()
  }

  return (
    <MatchQuery
      value={requestQuery}
      success={pluginRequest => {
        return (
          <Match
            value={pluginRequest.type}
            ReshareRequest={() => (
              <ReshareVaultFlowProviders>
                <KeygenOperationProvider value={{ reshare: 'plugin' }}>
                  <ReshareVaultKeygenActionProvider>
                    <ValueTransfer<PluginMetadata>
                      from={({ onFinish }) => (
                        <PluginJoinKeygenUrl onFinish={onFinish} />
                      )}
                      to={({ value }) => <PluginReshareFlow value={value} />}
                    />
                  </ReshareVaultKeygenActionProvider>
                </KeygenOperationProvider>
              </ReshareVaultFlowProviders>
            )}
            PluginCreatePolicy={() => {
              const decoded = base64Decode(
                (pluginRequest.payload as PluginCreatePolicyProps).recipe
              )

              const policy = fromBinary(PolicySchema, decoded)
              
              return (
                <VStack fullHeight>
                  <PageHeader
                    primaryControls={
                      <IconButton onClick={handleClose}>
                        <CrossIcon />
                      </IconButton>
                    }
                    title="Create Policy"
                    hasBorder
                  />
                  <PageContent flexGrow scrollable>
                    <List></List>
                  </PageContent>
                </VStack>
              )
            }}
          />
        )
      }}
    />
  )
}
