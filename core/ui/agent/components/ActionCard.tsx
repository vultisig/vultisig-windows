import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import styled from 'styled-components'

import { Action } from '../types'
import { getActionIcon } from './shared/actionIcons'
import { agentCard, agentCardInteractiveHover } from './shared/agentCard'
import { AgentCardIcon } from './shared/AgentCardIcon'

type Props = {
  action: Action
  onExecute: (action: Action) => void
}

export const ActionCard: FC<Props> = ({ action, onExecute }) => {
  const icon = getActionIcon(action.type)

  return (
    <Card onClick={() => onExecute(action)}>
      <HStack gap={12} alignItems="center">
        <AgentCardIcon>{icon}</AgentCardIcon>
        <VStack gap={2}>
          <Text size={14} weight={500}>
            {action.title}
          </Text>
          {action.description && (
            <Text size={12} color="supporting">
              {action.description}
            </Text>
          )}
        </VStack>
      </HStack>
    </Card>
  )
}

const Card = styled(UnstyledButton)`
  ${agentCard}
  ${agentCardInteractiveHover}
  width: 100%;
  text-align: left;
`
