import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useVaultChainCoinsQuery } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sum } from '@lib/utils/array/sum'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VaultAddressCopyButton } from '../page/components/VaultAddressCopyButton'

const AddressPill = styled(HStack)`
  padding: 4px 6px;
  border-radius: 8px;
  background: rgba(81, 128, 252, 0.12);

  & * {
    color: ${getColor('info')};
  }
`

export const VaultChainOverview = () => {
  const chain = useCurrentVaultChain()
  const address = useCurrentVaultAddress(chain)
  const vaultCoinsQuery = useVaultChainCoinsQuery(chain)
  const formatFiatAmount = useFormatFiatAmount()
  const { t } = useTranslation()

  return (
    <VStack alignItems="center" gap={32}>
      <VStack alignItems="center" gap={12}>
        <HStack alignItems="center" gap={8}>
          <ChainEntityIcon
            value={getChainLogoSrc(chain)}
            style={{ fontSize: 24 }}
          />
          <Text weight="500" color="contrast" size={16}>
            {chain}
          </Text>
        </HStack>
        <VStack alignItems="center" gap={8}>
          <MatchQuery
            value={vaultCoinsQuery}
            error={() => t('failed_to_load')}
            pending={() => <Spinner />}
            success={coins => {
              const total = sum(
                coins.map(({ amount, decimals, price = 0 }) =>
                  getCoinValue({
                    amount,
                    decimals,
                    price,
                  })
                )
              )

              return (
                <Text size={32} weight="700" color="contrast" centerVertically>
                  <BalanceVisibilityAware>
                    {formatFiatAmount(total)}
                  </BalanceVisibilityAware>
                </Text>
              )
            }}
          />
          <AddressPill alignItems="center" gap={4}>
            <Text weight={500} color="info" size={12}>
              {formatWalletAddress(address)}
            </Text>
            <VaultAddressCopyButton
              value={{
                address,
                chain,
              }}
            />
          </AddressPill>
        </VStack>
      </VStack>
      <VaultPrimaryActions coin={{ chain }} />
    </VStack>
  )
}
