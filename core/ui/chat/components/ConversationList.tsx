import { Conversation } from '@core/ui/chat/state/chatTypes'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type ConversationListProps = {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const formatRelativeDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  onDelete,
  onClose,
}: ConversationListProps) => {
  return (
    <Overlay onClick={onClose}>
      <Panel onClick={e => e.stopPropagation()}>
        <Header alignItems="center" justifyContent="space-between" fullWidth>
          <Text size={16} weight={600} color="contrast">
            History
          </Text>
          <IconButton onClick={onClose} title="Close">
            <IconWrapper size={16}>
              <CrossIcon />
            </IconWrapper>
          </IconButton>
        </Header>
        <ListContainer flexGrow scrollable>
          {conversations.length === 0 ? (
            <VStack padding={16} alignItems="center">
              <Text size={14} color="shy">
                No conversations yet
              </Text>
            </VStack>
          ) : (
            conversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                $active={conversation.id === activeConversationId}
                onClick={() => onSelect(conversation.id)}
              >
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  fullWidth
                >
                  <VStack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text size={14} weight={500} color="contrast" cropped>
                      {conversation.title || 'Untitled'}
                    </Text>
                    <Text size={12} color="shy">
                      {formatRelativeDate(conversation.updated_at)}
                    </Text>
                  </VStack>
                  <IconButton
                    onClick={e => {
                      e.stopPropagation()
                      onDelete(conversation.id)
                    }}
                    title="Delete"
                  >
                    <IconWrapper size={14}>
                      <TrashIcon />
                    </IconWrapper>
                  </IconButton>
                </HStack>
              </ConversationItem>
            ))
          )}
        </ListContainer>
      </Panel>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-start;
`

const Panel = styled(VStack)`
  width: 280px;
  height: 100%;
  background: ${getColor('background')};
  border-right: 1px solid ${getColor('foregroundExtra')};
`

const Header = styled(HStack)`
  padding: 16px;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
`

const ListContainer = styled(VStack)`
  flex: 1;
  min-height: 0;
`

const ConversationItem = styled.div<{ $active: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  background: ${({ $active }) =>
    $active ? getColor('foreground') : 'transparent'};
  border-left: 3px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary.toCssValue() : 'transparent'};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
