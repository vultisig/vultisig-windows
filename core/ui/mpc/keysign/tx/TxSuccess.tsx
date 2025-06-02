import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { interactive } from '@lib/ui/css/interactive'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '../../../chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '../../../chain/coin/icon/utils/shouldDisplayChainLogo'
import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'

export const TxSuccess = ({
  onFinish,
  onSeeTxDetails,
  value,
}: ValueProp<KeysignPayload> &
  OnFinishProp & {
    onSeeTxDetails: () => void
  }) => {
  const { coin: potentialCoin } = value
  const { t } = useTranslation()
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const amount = fromChainAmount(BigInt(value.toAmount), coin.decimals)
  const priceQuery = useCoinPriceQuery({
    coin,
  })

  const { id, ticker, chain } = coin

  return (
    <Wrapper justifyContent="space-between" gap={36} flexGrow>
      <AnimationWrapper>
        <Animation src="/core/animations/vault-created.riv" />
        <AnimatedVisibility delay={300}>
          <SuccessText centerHorizontally size={24}>
            {t('transaction_successful')}
          </SuccessText>
        </AnimatedVisibility>
      </AnimationWrapper>
      <VStack gap={8} fullWidth>
        <OverviewWrapper alignItems="center" gap={12}>
          {coin && (
            <ChainCoinIcon
              coinSrc={coin.logo ? getCoinLogoSrc(coin.logo) : undefined}
              chainSrc={
                shouldDisplayChainLogo({
                  ticker,
                  chain,
                  isNative: isFeeCoin({
                    id,
                    chain,
                  }),
                })
                  ? getChainLogoSrc(coin.chain)
                  : undefined
              }
              style={{ fontSize: 16 }}
            />
          )}
          <VStack alignItems="center">
            <Text>{amount}</Text>
            <MatchQuery
              value={priceQuery}
              success={price => (
                <Text color="supporting">{price.toFixed(2)}</Text>
              )}
            />
          </VStack>
        </OverviewWrapper>
        <TxDetailsButton
          justifyContent="space-between"
          alignItems="center"
          fullWidth
          role="button"
          tabIndex={0}
          onClick={onSeeTxDetails}
        >
          <Text size={14} color="contrast">
            {t('transaction_details')}
          </Text>
          <ChevronRightIcon />
        </TxDetailsButton>
      </VStack>
      <Button onClick={onFinish}>{t('done')}</Button>
    </Wrapper>
  )
}

const Wrapper = styled(PageContent)`
  width: min(100%, 550px);
  margin-inline: auto;
  padding-top: 64px;
`

const AnimationWrapper = styled.div`
  width: 100%;
  height: 250px;
  position: relative;
  margin-inline: auto;
`

const SuccessText = styled(GradientText)`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
`

const OverviewWrapper = styled(VStack)`
  border-radius: 16px;
  padding: 16px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`

const TxDetailsButton = styled(HStack)`
  padding: 16px 24px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  ${interactive};
`
