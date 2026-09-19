import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { VStack } from '@lib/ui/layout/Stack'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { Trans, useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { riskLevelIcon } from '../riskLevelIcon'
import { BlockaidTxScanResult } from './queries/blockaidTxValidation'
import { getRiskyTxColor } from './utils/color'

const Medallion = styled.div<{ $color: string }>`
  position: relative;
  ${sameDimensions(44)};
  ${centerContent};
  ${borderRadius.pill};
  overflow: hidden;
  flex-shrink: 0;
  background: ${getColor('background')};
  border: 2px solid ${({ theme }) => theme.colors.contrast.toRgba(0.9)};
  box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.25);
  color: ${({ $color }) => $color};
  font-size: 20px;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 8px;
    background: ${({ $color }) => $color};
    filter: blur(8px);
  }
`

const Icon = styled.div`
  position: relative;
  z-index: 1;
  ${centerContent};
`

const Title = styled.p<{ $color: string }>`
  ${text({
    size: 22,
    weight: 500,
    height: 24 / 22,
    letterSpacing: -0.36,
    centerHorizontally: true,
  })}
  color: ${({ $color }) => $color};
  margin: 0;
`

const Description = styled(Text)`
  margin: 0;
`

const Attribution = styled.p`
  ${text({
    color: 'supporting',
    variant: 'caption',
    centerVertically: { gap: 4 },
  })}
  margin: 0;
  justify-content: center;
`

const ContinueAnyway = styled(UnstyledButton)`
  ${text({ color: 'supporting', variant: 'stationCaption2' })}
  align-self: center;
  padding: 14px 4px;

  &:hover {
    color: ${getColor('danger')};
  }
`

type BlockaidRiskReviewProps = {
  value: NonNullable<BlockaidTxScanResult>
}

/**
 * What a review sheet shows in place of the transaction summary when Blockaid
 * flags it: the verdict, coloured by severity, over the scan's explanation.
 * Pair with {@link BlockaidRiskReviewActions} in the sheet's footer.
 */
export const BlockaidRiskReview = ({ value }: BlockaidRiskReviewProps) => {
  const { t } = useTranslation()
  const { colors } = useTheme()

  const RiskIcon = riskLevelIcon[value.level]
  const color = getRiskyTxColor(value.level, colors)

  return (
    <VStack alignItems="center" gap={24} style={{ padding: '4px 0' }}>
      <Medallion $color={color}>
        <Icon>
          <RiskIcon />
        </Icon>
      </Medallion>
      <VStack gap={12} fullWidth>
        <Title $color={color}>
          {t('risky_transaction_detected', {
            riskLevel: capitalizeFirstLetter(value.level),
          })}
        </Title>
        <Description
          variant="stationBodyS"
          color="shy"
          centerHorizontally
          as="p"
        >
          {value.description ?? t('risky_tx_warning')}
        </Description>
      </VStack>
      <Attribution>
        <Trans
          i18nKey="powered_by"
          components={{ provider: <BlockaidLogo /> }}
        />
      </Attribution>
    </VStack>
  )
}

type BlockaidRiskReviewActionsProps = {
  onGoBack: () => void
  onContinue: () => void
}

/** The way out of a flagged transaction, and the deliberately quiet way past it. */
export const BlockaidRiskReviewActions = ({
  onGoBack,
  onContinue,
}: BlockaidRiskReviewActionsProps) => {
  const { t } = useTranslation()

  return (
    <VStack gap={4}>
      <Button onClick={onGoBack}>{t('go_back')}</Button>
      <ContinueAnyway onClick={onContinue}>
        {t('continue_anyway')}
      </ContinueAnyway>
    </VStack>
  )
}
