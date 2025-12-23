import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { DefiChainPortfolio } from '../hooks/useDefiPortfolios'

type DefiChainItemProps = {
  balance: DefiChainPortfolio
}

export const DefiChainItem = ({ balance }: DefiChainItemProps) => {
  const { chain, totalFiat, positionsWithBalanceCount, isLoading } = balance
  const navigate = useCoreNavigate()

  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()

  const handleClick = () => {
    navigate({ id: 'defiChainDetail', state: { chain } })
  }

  return (
    <StyledPanel data-testid="DefiChainItem-Panel" onClick={handleClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 32 }}
        />

        <HStack
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={20}
        >
          <Text color="contrast" size={14}>
            {chain}
          </Text>
          <HStack gap={8} alignItems="center">
            <VStack gap={4} alignItems="flex-end">
              <Text centerVertically color="contrast" weight="550" size={14}>
                {isLoading ? (
                  <Spinner size={16} />
                ) : (
                  <BalanceVisibilityAware>
                    {formatFiatAmount(totalFiat)}
                  </BalanceVisibilityAware>
                )}
              </Text>
              <Text color="shy" weight="500" size={12} centerVertically>
                {isLoading ? (
                  <Spinner size={12} />
                ) : positionsWithBalanceCount > 0 ? (
                  <BalanceVisibilityAware>
                    {positionsWithBalanceCount} {t('positions')}
                  </BalanceVisibilityAware>
                ) : (
                  t('no_positions_found')
                )}
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
