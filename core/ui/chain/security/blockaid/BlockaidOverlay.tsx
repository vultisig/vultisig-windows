import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { TitleProp } from '@lib/ui/props'
import { PromptSheet } from '@lib/ui/sheet/PromptSheet'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'
import { Trans, useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useCore } from '../../../state/core'
import { BlockaidLogo } from './BlockaidLogo'
import { riskLevelIcon } from './riskLevelIcon'
import { getRiskyTxColor } from './tx/utils/color'

const DismissButton = styled(UnstyledButton)`
  ${text({
    color: 'supporting',
    size: 10,
  })}

  &:hover {
    color: ${getColor('danger')};
  }
`

const SheetAttribution = styled.div`
  ${text({
    color: 'supporting',
    variant: 'caption',
    centerVertically: { gap: 4 },
  })}
  margin: 0;
  justify-content: center;
`

const SheetTitle = styled.p<{ $color: string }>`
  ${text({
    size: 22,
    weight: 500,
    height: 24 / 22,
    centerHorizontally: true,
  })}
  color: ${({ $color }) => $color};
  margin: 0;
`

const SheetDescription = styled.p`
  ${text({
    color: 'supporting',
    size: 14,
    weight: 500,
    height: 20 / 14,
    centerHorizontally: true,
  })}
  margin: 0;
`

const SheetActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

type BlockaidOverlayProps = TitleProp & {
  riskLevel: RiskLevel
  description?: string
}

export const BlockaidOverlay = ({
  riskLevel,
  description,
  title,
}: BlockaidOverlayProps) => {
  const [isDismissed, { set: dismiss }] = useBoolean(false)

  const Icon = riskLevelIcon[riskLevel]

  const { colors } = useTheme()

  const color = getRiskyTxColor(riskLevel, colors)

  const { t } = useTranslation()

  const { goBack } = useCore()

  if (isDismissed) return null

  if (riskLevel === 'medium') {
    return (
      <PromptSheet
        eyebrow={
          <SheetAttribution>
            <Trans
              i18nKey="powered_by"
              components={{ provider: <BlockaidLogo /> }}
            />
          </SheetAttribution>
        }
        icon={<Icon fontSize={24} style={{ color }} />}
        title={<SheetTitle $color={color}>{title}</SheetTitle>}
        description={
          description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null
        }
        actions={
          <SheetActions>
            <Button onClick={goBack}>{t('go_back')}</Button>
            <DismissButton onClick={dismiss}>
              {t('continue_anyway')}
            </DismissButton>
          </SheetActions>
        }
        isDismissable={false}
        onClose={dismiss}
      />
    )
  }

  return (
    <Modal
      footer={
        <VStack gap={20}>
          <Button onClick={goBack}>{t('go_back')}</Button>
          <DismissButton onClick={dismiss}>
            {t('continue_anyway')}
          </DismissButton>
        </VStack>
      }
    >
      <VStack alignItems="center" gap={24}>
        <VStack alignItems="center" gap={48}>
          <Icon fontSize={24} style={{ color }} />
          <VStack alignItems="center" gap={12}>
            <Text centerHorizontally size={22} style={{ color }}>
              {title}
            </Text>
            {description && (
              <Text centerHorizontally size={14} color="supporting">
                {description}
              </Text>
            )}
          </VStack>
        </VStack>
        <Text color="supporting" centerVertically={{ gap: 4 }} size={14}>
          <Trans
            i18nKey="powered_by"
            components={{ provider: <BlockaidLogo /> }}
          />
        </Text>
      </VStack>
    </Modal>
  )
}
