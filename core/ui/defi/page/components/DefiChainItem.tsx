import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { shrinkable } from '@lib/ui/css/shrinkable'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { StationChevronRightSmallIcon } from '@lib/ui/icons/StationFigmaIcons'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { DefiChainPortfolio } from '../hooks/useDefiPortfolios'

type DefiChainItemProps = {
  balance: DefiChainPortfolio
}

export const DefiChainItem = ({ balance }: DefiChainItemProps) => {
  const { chain, totalFiat, positionsWithBalanceCount, isLoading } = balance
  const navigate = useCoreNavigate()

  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const { iconStyle } = useTheme()

  const handleClick = () => {
    navigate({ id: 'defiChainDetail', state: { chain } })
  }

  return (
    <StyledPanel data-testid="DefiChainItem-Panel" onClick={handleClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: iconStyle === 'station' ? 36 : 32 }}
        />

        <ContentRow
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={20}
        >
          <Text color="contrast" size={14}>
            {chain}
          </Text>
          <TrailingGroup gap={8} alignItems="center">
            <BalanceGroup gap={4} alignItems="flex-end">
              <Text centerVertically color="contrast" weight="550" size={14}>
                {isLoading ? (
                  <Spinner size={16} />
                ) : (
                  <BalanceVisibilityAware>
                    {formatFiatAmount(totalFiat)}
                  </BalanceVisibilityAware>
                )}
              </Text>
              {isLoading ? (
                <Text color="shy" weight="500" size={12} centerVertically>
                  <Spinner size={12} />
                </Text>
              ) : (
                <Text color="shy" weight="500" size={12} cropped>
                  <BalanceVisibilityAware>
                    {positionsWithBalanceCount > 0
                      ? `${positionsWithBalanceCount} ${t('positions')}`
                      : t('no_positions_found')}
                  </BalanceVisibilityAware>
                </Text>
              )}
            </BalanceGroup>
            <IconWrapper>
              {iconStyle === 'station' ? (
                <StationChevronRightSmallIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconWrapper>
          </TrailingGroup>
        </ContentRow>
      </HStack>
    </StyledPanel>
  )
}

const ContentRow = styled(HStack)`
  ${shrinkable};
`

const TrailingGroup = styled(HStack)`
  ${shrinkable};
`

const BalanceGroup = styled(VStack)`
  ${shrinkable};
`

const StyledPanel = styled(Panel)`
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }

  ${({ theme }) =>
    theme.iconStyle === 'station' &&
    css`
      border-radius: 0;
      background: ${theme.colors.foreground.toCssValue()};
      padding: 12px;

      &:hover {
        background: ${theme.colors.foregroundDark.toCssValue()};
      }
    `}
`
