import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AgentBotPromptIcon } from '../icons/AgentBotPromptIcon'
import { AgentBtcPromptIcon } from '../icons/AgentBtcPromptIcon'
import { AgentMoneyPromptIcon } from '../icons/AgentMoneyPromptIcon'
import { AgentOrbIcon } from '../icons/AgentOrbIcon'
import { AgentSendPromptIcon } from '../icons/AgentSendPromptIcon'

type PromptVariant = 'blue' | 'green' | 'orange'

type Prompt = {
  icon: ReactNode
  textKey: string
  variant: PromptVariant
}

const prompts: Prompt[] = [
  {
    icon: <AgentBotPromptIcon style={{ fontSize: 16 }} />,
    textKey: 'agent_prompt_show_plugins',
    variant: 'blue',
  },
  {
    icon: <AgentMoneyPromptIcon style={{ fontSize: 16 }} />,
    textKey: 'agent_prompt_earn_apy',
    variant: 'blue',
  },
  {
    icon: <AgentSendPromptIcon style={{ fontSize: 16 }} />,
    textKey: 'agent_prompt_send',
    variant: 'green',
  },
  {
    icon: <AgentBtcPromptIcon style={{ fontSize: 16 }} />,
    textKey: 'agent_prompt_swap',
    variant: 'orange',
  },
]

type Props = {
  onSelect: (text: string) => void
}

export const AgentEmptyState: FC<Props> = ({ onSelect }) => {
  const { t } = useTranslation()

  return (
    <Container>
      <VStack gap={48} alignItems="center">
        <AgentOrbIcon />
        <VStack gap={54} alignItems="center">
          <VStack gap={20} alignItems="center">
            <CenteredText
              size={18}
              weight={400}
              height={19 / 18}
              letterSpacing={-0.18}
            >
              {t('agent_what_to_do')}
            </CenteredText>
            <CenteredText
              size={18}
              weight={400}
              height={19 / 18}
              letterSpacing={-0.18}
            >
              {t('agent_help_description')}
            </CenteredText>
          </VStack>
          <PromptsContainer>
            {prompts.map(prompt => {
              const text = t(prompt.textKey)
              return (
                <PromptChip
                  key={prompt.textKey}
                  $variant={prompt.variant}
                  onClick={() => onSelect(text)}
                >
                  <HStack gap={4} alignItems="center">
                    {prompt.icon}
                    <Text size={12} weight={500} nowrap>
                      {text}
                    </Text>
                  </HStack>
                </PromptChip>
              )
            })}
          </PromptsContainer>
        </VStack>
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`

const CenteredText = styled(Text)`
  text-align: center;
  max-width: 295px;
`

const PromptsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px 8px;
  width: 345px;
`

const promptVariantBackground: Record<PromptVariant, string> = {
  blue: `hsla(224, 98%, 64%, 0.1)`,
  green: `hsla(166, 83%, 43%, 0.05)`,
  orange: `hsla(39, 100%, 50%, 0.1)`,
}

const PromptChip = styled(UnstyledButton)<{ $variant: PromptVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  background: ${p => promptVariantBackground[p.$variant]};
  border: 1px solid rgba(255, 255, 255, 0.03);
  color: ${getColor('text')};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`
