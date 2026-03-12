import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

import type { AgentAction } from '../state/chatTypes'

type ActionPromptProps = {
  actions: AgentAction[]
  onApprove: (action: AgentAction) => void
  onReject: (action: AgentAction) => void
}

export const ActionPrompt = ({
  actions,
  onApprove,
  onReject,
}: ActionPromptProps) => {
  return (
    <VStack gap={8}>
      {actions.map(action => (
        <ActionCard key={action.id}>
          <VStack gap={8}>
            <HStack alignItems="center" gap={8}>
              <ActionBadge>{action.type}</ActionBadge>
              <Text size={13} weight={500} color="contrast">
                {action.title}
              </Text>
            </HStack>
            {action.description && (
              <Text size={12} color="shy">
                {action.description}
              </Text>
            )}
            <HStack gap={8}>
              <Button onClick={() => onApprove(action)}>Approve</Button>
              <Button kind="outlined" onClick={() => onReject(action)}>
                Reject
              </Button>
            </HStack>
          </VStack>
        </ActionCard>
      ))}
    </VStack>
  )
}

const ActionCard = styled.div`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme }) =>
      theme.colors.primary.getVariant({ a: () => 0.3 }).toCssValue()};
  background: ${({ theme }) =>
    theme.colors.primary.getVariant({ a: () => 0.08 }).toCssValue()};
`

const ActionBadge = styled.span`
  font-size: 11px;
  font-family: monospace;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ theme }) =>
    theme.colors.primary.getVariant({ a: () => 0.2 }).toCssValue()};
  color: ${({ theme }) => theme.colors.primary.toCssValue()};
`
