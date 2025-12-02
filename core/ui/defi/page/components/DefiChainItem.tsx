import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { VaultChainBalance } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sum } from '@lib/utils/array/sum'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type DefiChainItemProps = {
  balance: VaultChainBalance
}

export const DefiChainItem = ({ balance }: DefiChainItemProps) => {
  const { chain, coins } = balance
  const navigate = useCoreNavigate()

  const { t } = useTranslation()
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

  const handleClick = () => {
    navigate({ id: 'defiChainDetail', state: { chain: chain as Chain } })
  }

  return (
    <StyledPanel data-testid="DefiChainItem-Panel" onClick={handleClick}>
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
            </VStack>
            <HStack gap={8} alignItems="center">
              <VStack
                gap={8}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                <Text centerVertically color="contrast" weight="550" size={14}>
                  <BalanceVisibilityAware>
                    {formatFiatAmount(totalAmount)}
                  </BalanceVisibilityAware>
                </Text>
                <Text color="shy" weight="500" size={12} centerVertically>
                  {singleCoin ? (
                    <BalanceVisibilityAware>
                      {formatAmount(
                        fromChainAmount(singleCoin.amount, singleCoin.decimals),
                        { precision: 'high', ticker: singleCoin.ticker }
                      )}
                    </BalanceVisibilityAware>
                  ) : coins.length > 1 ? (
                    <BalanceVisibilityAware>
                      <>
                        {coins.length} {t('assets')}
                      </>
                    </BalanceVisibilityAware>
                  ) : null}
                </Text>
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
  max-height: 64px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
