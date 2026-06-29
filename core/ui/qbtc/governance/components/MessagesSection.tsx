import { deriveCosmosMessageLabel } from '@core/ui/transaction-history/cosmosMessageLabel'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * Lists the proposal's wrapped message type URLs (e.g.
 * `/cosmos.gov.v1.MsgExecLegacyContent`) with a friendly label, mirroring iOS'
 * generic Messages section — no per-message field decoding.
 */
export const MessagesSection = ({
  messageTypes,
}: {
  messageTypes: string[]
}) => {
  const { t } = useTranslation()

  if (messageTypes.length === 0) return null

  return (
    <Card>
      <Text size={14} weight="500">
        {t('qbtc_gov.messages')}
      </Text>
      <VStack gap={10}>
        {messageTypes.map((type, index) => (
          <VStack key={`${type}-${index}`} gap={2}>
            <Text size={13} weight="500">
              {deriveCosmosMessageLabel(type)}
            </Text>
            <Text size={11} color="shy">
              {type}
            </Text>
          </VStack>
        ))}
      </VStack>
    </Card>
  )
}

const Card = styled(VStack).attrs({ gap: 12 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  background: ${getColor('foreground')};
`
