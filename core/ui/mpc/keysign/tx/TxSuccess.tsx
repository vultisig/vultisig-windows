import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
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
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TxOverviewAmount } from './TxOverviewAmount'

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

  return (
    <Wrapper gap={36} flexGrow>
      <AnimationWrapper>
        <Animation src="/core/animations/vault-created.riv" />
        <AnimatedVisibility delay={300}>
          <SuccessText centerHorizontally size={24}>
            {t('transaction_successful')}
          </SuccessText>
        </AnimatedVisibility>
      </AnimationWrapper>
      <VStack gap={8} fullWidth>
        <TxOverviewAmount amount={amount} value={coin} />
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
      <Button
        style={{
          marginTop: 'auto',
        }}
        onClick={onFinish}
      >
        {t('done')}
      </Button>
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

const TxDetailsButton = styled(HStack)`
  padding: 16px 24px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  ${interactive};

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
