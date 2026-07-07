import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { TitleProp } from '@lib/ui/props'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'
import { ReactNode, useId } from 'react'
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

const SheetBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 16px 0;
`

const Sheet = styled(VStack)`
  width: min(100%, 420px);
  max-height: min(88vh, 520px);
  overflow-y: auto;
  background: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-bottom: 0;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -18px 80px rgba(0, 0, 0, 0.34);
  padding: 12px 20px 24px;
`

const SheetGrabber = styled.div`
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: ${getColor('foregroundSuper')};
`

const RiskIconFrame = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.m};
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
      <BlockaidWarningSheet
        color={color}
        description={description}
        icon={<Icon fontSize={24} style={{ color }} />}
        onContinue={dismiss}
        onGoBack={goBack}
        title={title}
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

type BlockaidWarningSheetProps = TitleProp & {
  color: string
  description?: string
  icon: ReactNode
  onContinue: () => void
  onGoBack: () => void
}

const BlockaidWarningSheet = ({
  color,
  description,
  icon,
  onContinue,
  onGoBack,
  title,
}: BlockaidWarningSheetProps) => {
  const { t } = useTranslation()
  const titleId = useId()

  useKeyDown('Escape', onContinue)

  return (
    <BodyPortal>
      <SheetBackdrop>
        <Sheet
          role="dialog"
          aria-modal
          aria-labelledby={titleId}
          gap={24}
          alignItems="center"
        >
          <SheetGrabber />
          <VStack alignItems="center" gap={20}>
            <RiskIconFrame>{icon}</RiskIconFrame>
            <VStack alignItems="center" gap={12}>
              <Text id={titleId} centerHorizontally size={22} style={{ color }}>
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
          <VStack gap={16} fullWidth>
            <HStack fullWidth>
              <Button onClick={onGoBack}>{t('go_back')}</Button>
            </HStack>
            <DismissButton onClick={onContinue}>
              {t('continue_anyway')}
            </DismissButton>
          </VStack>
        </Sheet>
      </SheetBackdrop>
    </BodyPortal>
  )
}
