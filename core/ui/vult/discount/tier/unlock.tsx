import { extractCoinKey } from '@core/chain/coin/Coin'
import { vult } from '@core/chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
} from '@core/chain/swap/affiliate/config'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { ValueProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '../../../storage/coins'
import { discountTierColors } from './colors'
import { discountTierIcons } from './icons'

const Title = styled.p<ValueProp<VultDiscountTier>>`
  ${text({
    size: 28,
    centerHorizontally: true,
  })}

  b {
    color: ${({ value }) => discountTierColors[value].toCssValue()};
    font-weight: 500;
  }
`

const Description = styled.p`
  ${text({
    size: 14,
    centerHorizontally: true,
    color: 'shy',
    height: 'large',
  })}

  b {
    color: ${getColor('text')};
    font-weight: 600;
  }
`

export const UnlockDiscountTier = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const Icon = discountTierIcons[value]

  const { mutate: createCoin } = useCreateCoinMutation()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Button onClick={onOpen}>{t('unlock_tier')}</Button>
      )}
      renderContent={({ onClose }) => (
        <Modal
          onClose={onClose}
          footer={
            <Button
              onClick={() =>
                createCoin(vult, {
                  onSuccess: coin => {
                    navigate({
                      id: 'swap',
                      state: { toCoin: extractCoinKey(coin) },
                    })
                  },
                })
              }
            >
              {t('unlock_tier')}
            </Button>
          }
        >
          <VStack alignItems="center" gap={36}>
            <VStack alignItems="center" gap={26}>
              <Icon fontSize={72} />
              <Title value={value}>
                <Trans
                  i18nKey="unlock_discount_tier"
                  values={{ tier: t(value) }}
                  components={{ b: <b /> }}
                />
              </Title>
            </VStack>
            <Description>
              <Trans
                i18nKey="unlock_discount_tier_description"
                values={{
                  tier: t(value),
                  minBalance: formatAmount(vultDiscountTierMinBalances[value], {
                    ticker: `$${vult.ticker}`,
                  }),
                  bps: vultDiscountTierBps[value],
                }}
                components={{ b: <b /> }}
              />
            </Description>
          </VStack>
        </Modal>
      )}
    />
  )
}
