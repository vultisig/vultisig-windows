import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ThinkingIndicator: FC = () => {
  const { t } = useTranslation()

  return (
    <Container>
      <MessageWrapper>
        <BotAvatar>
          <SparklesIcon />
        </BotAvatar>
        <VStack gap={8}>
          <Text size={12} color="supporting" weight={600}>
            {t('vultibot')}
          </Text>
          <HStack gap={8} alignItems="center">
            <Spinner />
            <Text size={14} color="supporting">
              {t('thinking')}...
            </Text>
          </HStack>
        </VStack>
      </MessageWrapper>
    </Container>
  )
}

const Container = styled.div`
  padding: 8px 0;
  display: flex;
  justify-content: flex-start;
`

const MessageWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`

const BotAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #33e6bf 0%, #0439c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  color: white;
`
