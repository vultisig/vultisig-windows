import { settingsReadOnlySurface } from '@core/ui/settings/settingsField'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

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

  return (
    <VStack gap={isSettingsLook ? 12 : 16}>
      {showMethod && (
        <ReviewItem $isSettingsLook={isSettingsLook}>
          <Text color="shy" {...labelProps}>
            {t('signing_method')}
          </Text>
          <ReviewValue $isSettingsLook={isSettingsLook} {...valueProps}>
            {method}
          </ReviewValue>
        </ReviewItem>
      )}
      <ReviewItem $isSettingsLook={isSettingsLook}>
        <Text color="shy" {...labelProps}>
          {t('message_to_sign')}
        </Text>
        <MessageText $isSettingsLook={isSettingsLook} {...valueProps}>
          {formattedMessage}
        </MessageText>
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

const ReviewValue = styled(Text)<{ $isSettingsLook: boolean }>`
  ${({ $isSettingsLook }) =>
    $isSettingsLook &&
    css`
      position: relative;
      top: 1px;
    `}
`

const MessageText = styled(ReviewValue)`
  white-space: pre-wrap;
  word-break: break-word;
`
