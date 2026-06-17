import { DefiFiatAmount } from '@core/ui/defi/shared/DefiFiatAmount'
import { DefiTokenAmount } from '@core/ui/defi/shared/DefiTokenAmount'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { sVultCoin, vultCoin, vultStakingName } from '../core/config'
import { useStakedVultBalanceQuery } from '../queries/useStakedVultBalanceQuery'
import { useStakedVultFiatBalanceQuery } from '../queries/useStakedVultFiatBalanceQuery'
import { VultLogoIcon } from '../VultLogoIcon'

/** Always-visible DeFi portfolio entry that opens the VULT staking page. */
export const VultStakingDefiItem = () => {
  const navigate = useCoreNavigate()
  const balanceQuery = useStakedVultBalanceQuery()
  const fiatBalanceQuery = useStakedVultFiatBalanceQuery()

  const handleClick = () => {
    navigate({ id: 'defi', state: { protocol: 'vultStaking' } })
  }

  return (
    <StyledPanel onClick={handleClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <VultLogoIcon style={{ fontSize: 32 }} />
        <HStack
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={20}
        >
          <Text color="contrast" size={14}>
            {vultStakingName}
          </Text>
          <HStack gap={8} alignItems="center">
            <VStack
              gap={8}
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Text centerVertically color="contrast" weight="550" size={14}>
                <BalanceVisibilityAware>
                  <DefiFiatAmount query={fiatBalanceQuery} />
                </BalanceVisibilityAware>
              </Text>
              <Text color="shy" weight="500" size={12} centerVertically>
                <BalanceVisibilityAware>
                  <DefiTokenAmount
                    query={balanceQuery}
                    ticker={vultCoin.ticker}
                    decimals={sVultCoin.decimals}
                  />
                </BalanceVisibilityAware>
              </Text>
            </VStack>
            <IconWrapper>
              <ChevronRightIcon />
            </IconWrapper>
          </HStack>
        </HStack>
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
