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

      const keysignPayload = await getKeysignPayload(
        transaction,
        vault,
        walletCore
      )

      return keysignPayload
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
      success={keysignPayload => (
        <StartKeysignPrompt value={{ keysign: keysignPayload }} />
      )}
    />
  )
}
