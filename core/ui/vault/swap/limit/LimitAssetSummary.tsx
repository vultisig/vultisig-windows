import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type LimitAssetSummaryProps = {
  fromCoin: Coin
  toCoin: Coin
  onEdit: () => void
}

/**
 * Collapsed form of the asset step, shown once the pair and amount are chosen so
 * the price step gets the full screen.
 */
export const LimitAssetSummary: FC<LimitAssetSummaryProps> = ({
  fromCoin,
  toCoin,
  onEdit,
}) => {
  const { t } = useTranslation()

  return (
    <Card alignItems="center" justifyContent="space-between" gap={12}>
      <HStack alignItems="center" gap={16}>
        <Text size={14} weight={500} color="contrast">
          {t('swap_limit_asset')}
        </Text>
        <HStack alignItems="center" gap={6}>
          <Text size={12} color="shy">
            {t('swap_limit_sell')}
          </Text>
          <CoinIcon coin={fromCoin} style={{ fontSize: 16 }} />
          <Text size={12} weight={500} color="contrast">
            {fromCoin.ticker}
          </Text>
        </HStack>
        <HStack alignItems="center" gap={6}>
          <Text size={12} color="shy">
            {t('swap_limit_buy')}
          </Text>
          <CoinIcon coin={toCoin} style={{ fontSize: 16 }} />
          <Text size={12} weight={500} color="contrast">
            {toCoin.ticker}
          </Text>
        </HStack>
      </HStack>
      <HStack alignItems="center" gap={8}>
        <CompleteMark>
          <CircleCheckIcon />
        </CompleteMark>
        <EditButton onClick={onEdit} data-testid="limit-asset-edit">
          <PencilIcon />
        </EditButton>
      </HStack>
    </Card>
  )
}

const Card = styled(HStack)`
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 12px;
  padding: 14px 16px;
`

const CompleteMark = styled.span`
  color: ${({ theme }) => theme.colors.success.toCssValue()};
  font-size: 16px;
  display: flex;
`

const EditButton = styled(UnstyledButton)`
  color: ${({ theme }) => theme.colors.textShy.toCssValue()};
  font-size: 16px;
  cursor: pointer;
  display: flex;
`
