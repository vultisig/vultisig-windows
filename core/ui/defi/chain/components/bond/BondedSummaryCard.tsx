import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BondCard, BondSectionHeader } from './CardPrimitives'

type Props = {
  coin: Coin
  totalBonded: bigint
  fiat: number
  onBond: () => void
  isPending: boolean
  isSkeleton?: boolean
  isBondingDisabled?: boolean
}

export const BondedSummaryCard = ({
  coin,
  totalBonded,
  fiat,
  onBond,
  isPending,
  isSkeleton,
  isBondingDisabled,
}: Props) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <BondCard>
      <VStack gap={16}>
        <BondSectionHeader>
          <HStack gap={10} alignItems="center">
            <CoinIcon coin={coin} style={{ fontSize: 32 }} />
            <VStack gap={2}>
              <Text size={13} color="shy">
                {t('total_bonded', { ticker: coin.ticker })}
              </Text>
              {isSkeleton ? (
                <VStack gap={4}>
                  <Skeleton width="160px" height="26px" />
                  <Skeleton width="120px" height="14px" />
                </VStack>
              ) : (
                <>
                  <Text size={24} weight="700" color="contrast">
                    {formatAmount(fromChainAmount(totalBonded, coin.decimals), {
                      ticker: coin.ticker,
                    })}
                  </Text>
                  <Text size={13} color="shy">
                    {formatFiatAmount(fiat)}
                  </Text>
                </>
              )}
            </VStack>
          </HStack>
        </BondSectionHeader>
        <Divider />
        {isPending || isSkeleton ? (
          <Skeleton width="100%" height="44px" borderRadius="10px" />
        ) : (
          <Button kind="primary" onClick={onBond} disabled={isBondingDisabled}>
            {t('bond_to_node')}
          </Button>
        )}
      </VStack>
    </BondCard>
  )
}

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--Borders-Light, #11284a);
`
