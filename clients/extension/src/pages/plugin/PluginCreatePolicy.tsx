import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import {
  PluginCreatePolicyProps,
  PluginRequestUnion,
} from '../../utils/interfaces'
import { base64Decode } from '@bufbuild/protobuf/wire'
import { getVaultId } from '@core/ui/vault/Vault'
import { getVaultTransactions } from '../../transactions/state/transactions'
import { useMutation } from '@tanstack/react-query'
import { create, fromBinary } from '@bufbuild/protobuf'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { PolicySchema } from '../../types/gen/policy_pb'
import { useEffect } from 'react'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'

export const PluginCreatePolicy = ({
  pluginRequest,
}: {
  pluginRequest: PluginRequestUnion
}) => {
  const currentVault = useCurrentVault()
  const { mutate: processTransaction, ...mutationStatus } = useMutation({
    mutationFn: async (pluginRequest: PluginRequestUnion) => {
      const transactions = await getVaultTransactions(getVaultId(currentVault))
      const transaction = getLastItem(transactions)
      if (!('custom' in transaction.transactionPayload)) {
        throw Error('invalid payload')
      }
      const request = pluginRequest.payload as PluginCreatePolicyProps
      const decoded = base64Decode(request.recipe)
      const policy = fromBinary(PolicySchema, decoded)
      console.log('policy', policy)

      const keysignMessagePayload: KeysignMessagePayload = {
        custom: create(CustomMessagePayloadSchema, {
          method: transaction.transactionPayload.custom.method,
          message: transaction.transactionPayload.custom.message,
        }),
      }
      return keysignMessagePayload
    },
  })
  const handleClose = (): void => {
    window.close()
  }

  useEffect(() => {
    processTransaction(pluginRequest)
  }, [pluginRequest])

  return (
    <MatchQuery
      value={mutationStatus}
      success={keysignMessagePayload => {
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
            <PageFooter>
              <StartKeysignPrompt
                keysignPayload={keysignMessagePayload}
                isDAppSigning={true}
              />
            </PageFooter>
          </VStack>
        )
      }}
    />
  )
}
