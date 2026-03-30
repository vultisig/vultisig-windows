import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const KeysignCustomMessageInfo = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation()

  const formattedMessage = withFallback(
    attempt(() => JSON.stringify(JSON.parse(value.message), null, 2)),
    value.message
  )

  return (
    <>
      <HStack alignItems="center" gap={4} justifyContent="space-between">
        <Text color="shy" weight="500">
          {t('method')}
        </Text>
        <Text>{value.method}</Text>
      </HStack>
      <VStack gap={4}>
        <Text color="shy" weight="500">
          {t('message')}
        </Text>
        <MessageContent>{formattedMessage}</MessageContent>
      </VStack>
    </>
  )
}

const MessageContent = styled(Text).attrs({
  family: 'mono',
  size: 14,
})`
  white-space: pre-wrap;
  word-break: break-word;
`
