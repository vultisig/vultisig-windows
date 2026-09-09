import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { TokenVerificationBadge } from '@core/ui/chain/coin/verification/TokenVerificationBadge'
import { CoinTicker } from '@core/ui/vault/chain/CoinTicker'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, hStack, VStack } from '@lib/ui/layout/Stack'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CoinPillButtonProps = ValueProp<
  Pick<Coin, 'id' | 'chain' | 'logo' | 'ticker'>
> &
  OnClickProp & {
    testId: string
  }

/**
 * Rounded coin pill that opens an asset picker — icon, ticker, a `Native`
 * sub-label for fee coins, and a chevron. Shared by the send form and both
 * swap tabs, which differ only in the test id they need on the trigger.
 */
export const CoinPillButton = ({
  value,
  onClick,
  testId,
}: CoinPillButtonProps) => {
  const { t } = useTranslation()

  return (
    <Container onClick={onClick} data-testid={testId}>
      <CoinIcon coin={value} style={{ fontSize: 32 }} />
      <Body gap={4} alignItems="center">
        <VStack gap={2}>
          <CoinTicker ticker={value.ticker} size={14} weight="500" />
          {isFeeCoin(value) ? (
            <Text weight="500" size={12} color="shy">
              {t('native')}
            </Text>
          ) : (
            <HStack>
              <TokenVerificationBadge value={value} />
            </HStack>
          )}
        </VStack>
        <Chevron />
      </Body>
    </Container>
  )
}

const Container = styled(UnstyledButton)`
  ${hStack({
    alignItems: 'center',
    gap: 8,
  })}
  text-align: left;
  padding: 6px;
  min-width: 0;
  ${borderRadius.pill};
  background-color: ${getColor('foregroundExtra')};

  > svg,
  > img {
    flex-shrink: 0;
  }
`

const Body = styled(HStack)`
  min-width: 0;
`

/**
 * The chevron is what tells the pill it opens a picker, so it must survive the
 * squeeze. Left to shrink it collapsed to nothing on the swap form's From
 * pill, where the amount field takes more of the row than the read-only To
 * amount does. The pill itself keeps its automatic minimum for the same
 * reason: below it the chevron sits outside the pill and reads as missing.
 */
const Chevron = styled(ChevronRightIcon)`
  flex-shrink: 0;
`
