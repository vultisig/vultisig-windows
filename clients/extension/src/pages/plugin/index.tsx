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
import {
  PluginCreatePolicyProps,
  PluginRequestUnion,
} from '../../utils/interfaces'
import { create, fromBinary } from '@bufbuild/protobuf'
import { PolicySchema } from '../../types/gen/policy_pb'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'

import { useCurrentVault } from '@core/ui/vault/state/currentVault'

import { getVaultId } from '@core/ui/vault/Vault'

import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { getVaultTransactions } from '../../transactions/state/transactions'

import { getLastItem } from '@lib/utils/array/getLastItem'

import { useMutation } from '@tanstack/react-query'
import { PluginCreatePolicy } from './PluginCreatePolicy'

export const PluginPage = () => {
  const requestQuery = useStoredPendingRequestQuery('plugin')

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
            PluginCreatePolicy={() => (
              <PluginCreatePolicy pluginRequest={pluginRequest} />
            )}
          />
        )
      }}
    />
  )
}
