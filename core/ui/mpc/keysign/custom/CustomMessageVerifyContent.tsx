import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CustomMessageVerifyContentProps = {
  method: string
  message: string
}

export const CustomMessageVerifyContent = ({
  method,
  message,
}: CustomMessageVerifyContentProps) => {
  const { t } = useTranslation()

  const formattedMessage = withFallback(
    attempt(() => JSON.stringify(JSON.parse(message), null, 2)),
    message
  )

  const showMethod = method.trim() !== ''

  return (
    <VStack gap={16}>
      {showMethod && (
        <ReviewItem>
          <Text size={12} color="shy" weight={500}>
            {t('signing_method')}
          </Text>
          <Text size={14} weight={500}>
            {method}
          </Text>
        </ReviewItem>
      )}
      <ReviewItem>
        <Text size={12} color="shy" weight={500}>
          {t('message_to_sign')}
        </Text>
        <MessageText size={14} weight={500}>
          {formattedMessage}
        </MessageText>
      </ReviewItem>
    </VStack>
  )
}

const ReviewItem = styled.div`
  ${vStack({
    gap: 12,
  })};

  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: rgba(11, 26, 58, 0.5);
  min-width: 0;
`

const MessageText = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`
