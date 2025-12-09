import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDefiPositions } from '@core/ui/storage/defiPositions'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
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
  const { chain, totalFiat } = balance
  const navigate = useCoreNavigate()

  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()

  const selectedPositions = useDefiPositions(chain)

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
                    {formatFiatAmount(totalFiat)}
                  </BalanceVisibilityAware>
                </Text>
                <Text color="shy" weight="500" size={12} centerVertically>
                  {selectedPositions.length > 0 ? (
                    <BalanceVisibilityAware>
                      {selectedPositions.length} {t('positions')}
                    </BalanceVisibilityAware>
                  ) : (
                    t('no_positions_selected')
                  )}
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
