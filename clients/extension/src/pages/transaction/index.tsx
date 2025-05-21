import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect } from 'react'
import styled from 'styled-components'
import { useMutation } from '@tanstack/react-query'

import { getStoredTransactions } from '../../utils/storage'
import { useVaults } from '@core/ui/storage/vaults'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getKeysignPayload } from '../../utils/tx/getKeySignPayload'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { ProductLogoBlock } from '@core/ui/product/ProductLogoBlock'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/StartKeysignPrompt'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'
import { KeysignMessage } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { create } from '@bufbuild/protobuf'

const StyledErrorState = styled(VStack)`
  background-color: ${getColor('backgroundsSecondary')};
  border-radius: 12px;
  padding: 64px;
`

const StyledText = styled(Text)`
  text-align: center;
`

export const TransactionPage = () => {
  const vaults = useVaults()
  const walletCore = useAssertWalletCore()
  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { mutate: processTransaction, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      const [transaction] = await getStoredTransactions()
      const vault = shouldBePresent(
        vaults.find(({ coins }) =>
          coins.some(
            ({ address }) =>
              address?.toLowerCase() ===
              transaction?.transactionDetails.from.toLowerCase()
          )
        )
      )

      setCurrentVaultId(vault.publicKeys.ecdsa)

      let keysignMessagePayload: KeysignMessagePayload
      if (transaction.isCustomMessage) {
        keysignMessagePayload = {
          custom: create(CustomMessagePayloadSchema, {
            method: transaction.customMessage?.method,
            message: transaction.customMessage?.message,
          }),
        }
      } else {
        keysignMessagePayload = {
          keysign: await getKeysignPayload(transaction, vault, walletCore),
        }
      }

      return keysignMessagePayload
    },
  })

  useEffect(() => {
    processTransaction()
  }, [processTransaction])

  return (
    <MatchQuery
      value={mutationStatus}
      pending={() => <ProductLogoBlock />}
      error={error => (
        <FlowErrorPageContent
          title="Failed to process transaction"
          message={extractErrorMsg(error)}
        />
      )}
      success={keysignMessagePayload => (
        <StartKeysignPrompt value={keysignMessagePayload} />
      )}
    />
  )
}
