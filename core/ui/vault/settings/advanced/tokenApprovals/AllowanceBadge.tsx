import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { CoinAmount } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { isUnlimitedAllowance } from './core/isUnlimitedAllowance'

type AllowanceBadgeProps = CoinAmount & {
  ticker: string
}

/**
 * Pill showing how much of a token a spender may move: "Unlimited" in the
 * warning tone for a max-uint256 allowance, otherwise the formatted amount.
 */
export const AllowanceBadge = ({
  amount,
  decimals,
  ticker,
}: AllowanceBadgeProps) => {
  const { t } = useTranslation()
  const isUnlimited = isUnlimitedAllowance(amount)

  return (
    <Container $isUnlimited={isUnlimited}>
      <Dot />
      <Text size={12} weight="500" color={isUnlimited ? 'idle' : 'shy'} nowrap>
        {isUnlimited
          ? t('unlimited')
          : `${formatTokenAmount({ rawAmount: amount, decimals }).display} ${ticker}`}
      </Text>
    </Container>
  )
}

const Dot = styled.span`
  width: 6px;
  height: 6px;
  ${borderRadius.pill};
  background: currentColor;
  flex: none;
`

const Container = styled.div<{ $isUnlimited: boolean }>`
  align-items: center;
  display: inline-flex;
  gap: 5px;
  padding: 3px 8px 3px 7px;
  ${borderRadius.pill};

  ${({ $isUnlimited }) =>
    $isUnlimited
      ? css`
          background: ${getColor('idleDark')};
          color: ${getColor('idle')};
        `
      : css`
          background: ${getColor('foregroundExtra')};
          color: ${getColor('textShy')};
        `}
`
