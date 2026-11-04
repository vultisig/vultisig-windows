import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { settingsReadOnlySurface } from '@core/ui/settings/settingsField'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CustomMessageVerifyContentProps = {
  method: string
  message: string
  /** The settings frames' tighter gap and exact type metrics. */
  isSettingsLook?: boolean
}

const defaultLabelProps = { size: 12, weight: 500 } as const
const settingsLabelProps = { variant: 'caption' } as const
const defaultValueProps = { size: 14, weight: 500 } as const
const settingsValueProps = { variant: 'stationBodyS' } as const

/** The signing method and message a user reviews before signing a custom message. */
export const CustomMessageVerifyContent = ({
  method,
  message,
  isSettingsLook = false,
}: CustomMessageVerifyContentProps) => {
  const { t } = useTranslation()

  const formattedMessage = withFallback(
    attempt(() => JSON.stringify(JSON.parse(message), null, 2)),
    message
  )

  const showMethod = method.trim() !== ''
  const labelProps = isSettingsLook ? settingsLabelProps : defaultLabelProps
  const valueProps = isSettingsLook ? settingsValueProps : defaultValueProps
  const ValueText = isSettingsLook ? SettingsBaselineText : Text

  return (
    <VStack gap={isSettingsLook ? 12 : 16}>
      {showMethod && (
        <ReviewItem $isSettingsLook={isSettingsLook}>
          <Text color="shy" {...labelProps}>
            {t('signing_method')}
          </Text>
          <ValueText {...valueProps}>{method}</ValueText>
        </ReviewItem>
      )}
      <ReviewItem $isSettingsLook={isSettingsLook}>
        <Text color="shy" {...labelProps}>
          {t('message_to_sign')}
        </Text>
        <MessageFrame>
          <ValueText {...valueProps}>{formattedMessage}</ValueText>
        </MessageFrame>
      </ReviewItem>
    </VStack>
  )
}

const ReviewItem = styled.div<{ $isSettingsLook: boolean }>`
  ${vStack({
    gap: 12,
  })};

  padding: ${({ $isSettingsLook }) =>
    $isSettingsLook ? '15px 19px' : '16px 20px'};
  ${borderRadius.md};
  border: 1px solid ${getColor('foregroundExtra')};
  background: rgba(11, 26, 58, 0.5);
  ${({ $isSettingsLook }) => $isSettingsLook && settingsReadOnlySurface};
  min-width: 0;
`

const MessageFrame = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`
