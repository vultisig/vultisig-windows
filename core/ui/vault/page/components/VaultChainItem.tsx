import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { VaultChainBalance } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sum } from '@lib/utils/array/sum'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import styled from 'styled-components'

import { useHandleVaultChainItemPress } from './useHandleVaultChainItemPress'
import { VaultAddressCopyButton } from './VaultAddressCopyButton'

type VaultChainItemProps = {
  balance: VaultChainBalance
}

export const VaultChainItem = ({ balance }: VaultChainItemProps) => {
  const { chain, coins } = balance

  const addresses = useCurrentVaultAddresses()
  const address = addresses[chain]

  const pressHandlers = useHandleVaultChainItemPress({
    chain,
    address,
  })

  const formatFiatAmount = useFormatFiatAmount()

  const singleCoin = coins.length === 1 ? coins[0] : null

  const totalAmount = sum(
    coins.map(coin =>
      getCoinValue({
        price: coin.price ?? 0,
        amount: coin.amount,
        decimals: coin.decimals,
      })
    )
  )

  return (
    <StyledPanel data-testid="VaultChainItem-Panel" {...pressHandlers}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 32 }}
        />

        <VStack fullWidth alignItems="start" gap={12}>
          <HStack
            fullWidth
            alignItems="center"
            justifyContent="space-between"
            gap={20}
          >
            <VStack>
              <Text color="contrast" size={14}>
                {chain}
              </Text>
              <HStack alignItems="center" gap={4}>
                <Text weight={500} color="shy" size={12}>
                  {formatWalletAddress(address)}
                </Text>
                <VaultAddressCopyButton
                  value={{
                    address,
                    chain,
                  }}
                />
              </HStack>
            </VStack>
            <HStack gap={8} alignItems="center">
              <VStack
                gap={8}
                justifyContent="space-between"
                alignItems="center"
              >
                <Text centerVertically color="contrast" weight="550" size={14}>
                  <BalanceVisibilityAware>
                    {formatFiatAmount(totalAmount)}
                  </BalanceVisibilityAware>
                </Text>
                {singleCoin ? (
                  <Text color="shy" weight="500" size={12} centerVertically>
                    <BalanceVisibilityAware>
                      {formatAmount(
                        fromChainAmount(singleCoin.amount, singleCoin.decimals),
                        { precision: 'high', ticker: singleCoin.ticker }
                      )}
                    </BalanceVisibilityAware>
                  </Text>
                ) : coins.length > 1 ? (
                  <BalanceVisibilityAware>
                    <Text color="shy" weight="500" size={12} centerVertically>
                      {coins.length} assets
                    </Text>
                  </BalanceVisibilityAware>
                ) : null}
              </VStack>
              <IconWrapper>
                <ChevronRightIcon />
              </IconWrapper>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </StyledPanel>
  )
}

const StyledPanel = styled(Panel)`
  cursor: pointer;

  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
