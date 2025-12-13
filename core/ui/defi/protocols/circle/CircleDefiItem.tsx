import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { usdc } from '@core/chain/coin/knownTokens'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { CircleIcon } from '@lib/ui/icons/CircleIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

import { circleName } from './core/config'
import { useCircleAccountUsdcBalanceQuery } from './queries/circleAccountUsdcBalance'
import { useCircleAccountUsdcFiatBalanceQuery } from './queries/useCircleAccountUsdcFiatBalanceQuery'

export const CircleDefiItem = () => {
  const navigate = useCoreNavigate()
  const formatFiatAmount = useFormatFiatAmount()
  const balanceQuery = useCircleAccountUsdcBalanceQuery()
  const fiatBalanceQuery = useCircleAccountUsdcFiatBalanceQuery()

  const handleClick = () => {
    navigate({ id: 'defi', state: { protocol: 'circle' } })
  }

  return (
    <StyledPanel onClick={handleClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <IconWrapper size={32}>
          <CircleIcon />
        </IconWrapper>

        <VStack fullWidth alignItems="start" gap={12}>
          <HStack
            fullWidth
            alignItems="center"
            justifyContent="space-between"
            gap={20}
          >
            <VStack>
              <Text color="contrast" size={14}>
                {circleName}
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
                    <MatchQuery
                      value={fiatBalanceQuery}
                      success={formatFiatAmount}
                      inactive={() => formatFiatAmount(0)}
                    />
                  </BalanceVisibilityAware>
                </Text>
                <Text color="shy" weight="500" size={12} centerVertically>
                  <BalanceVisibilityAware>
                    <MatchQuery
                      value={balanceQuery}
                      success={balance =>
                        formatAmount(fromChainAmount(balance, usdc.decimals), {
                          ticker: usdc.ticker,
                        })
                      }
                      inactive={() => formatAmount(0, { ticker: usdc.ticker })}
                    />
                  </BalanceVisibilityAware>
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
