import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { useCurrentVaultAddreses } from '@core/ui/vault/state/currentVaultCoins'
import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { round } from '@lib/ui/css/round'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sum } from '@lib/utils/array/sum'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import styled from 'styled-components'

import { BalanceVisibilityAware } from '../balance/visibility/BalanceVisibilityAware'
import { VaultChainBalance } from '../queries/useVaultChainsBalancesQuery'
import { useHandleVaultChainItemPress } from './useHandleVaultChainItemPress'

const Pill = styled.div`
  height: 24px;
  ${round};
  ${horizontalPadding(12)};
  font-size: 12px;
  ${centerContent};
  background: ${getColor('mist')};
`

type VaultChainItemProps = {
  balance: VaultChainBalance
}

export const VaultChainItem = ({ balance }: VaultChainItemProps) => {
  const { chain, coins } = balance
  const fiatCurrency = useFiatCurrency()

  const addresses = useCurrentVaultAddreses()
  const address = addresses[chain]

  const pressHandlers = useHandleVaultChainItemPress({
    chain,
    address,
  })

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
      <HStack fullWidth alignItems="center" gap={16}>
        <ChainEntityIcon
          value={getChainEntityIconSrc(chain)}
          style={{ fontSize: 32 }}
        />

        <VStack fullWidth alignItems="start" gap={12}>
          <HStack
            fullWidth
            alignItems="center"
            justifyContent="space-between"
            gap={20}
          >
            <Text color="contrast" weight="700" size={16}>
              {chain}
            </Text>
            <HStack alignItems="center" gap={12}>
              {singleCoin ? (
                <Text color="contrast" weight="400" size={12} centerVertically>
                  <BalanceVisibilityAware>
                    {formatTokenAmount(
                      fromChainAmount(singleCoin.amount, singleCoin.decimals)
                    )}
                  </BalanceVisibilityAware>
                </Text>
              ) : coins.length > 1 ? (
                <Pill>
                  <BalanceVisibilityAware>
                    {coins.length} assets
                  </BalanceVisibilityAware>
                </Pill>
              ) : null}
              <Text centerVertically color="contrast" weight="700" size={16}>
                <BalanceVisibilityAware>
                  {formatAmount(totalAmount, fiatCurrency)}
                </BalanceVisibilityAware>
              </Text>
            </HStack>
          </HStack>
          <Text color="primary" weight="400" size={12}>
            <BalanceVisibilityAware size="xxxl">
              {address}
            </BalanceVisibilityAware>
          </Text>
        </VStack>
      </HStack>
    </StyledPanel>
  )
}

const StyledPanel = styled(Panel)`
  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
