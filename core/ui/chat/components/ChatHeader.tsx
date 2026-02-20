import { IconButton } from '@lib/ui/buttons/IconButton'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type ChatHeaderProps = {
  onNewConversation: () => void
  onShowHistory: () => void
}

export const ChatHeader = ({
  onNewConversation,
  onShowHistory,
}: ChatHeaderProps) => {
  return (
    <Container alignItems="center" justifyContent="space-between" fullWidth>
      <HStack alignItems="center" gap={8}>
        <IconButton onClick={onShowHistory} title="Conversation history">
          <IconWrapper size={20}>
            <MenuIcon />
          </IconWrapper>
        </IconButton>
        <Text size={18} weight={600} color="contrast">
          Chat
        </Text>
      </HStack>
      <IconButton onClick={onNewConversation} title="New conversation">
        <IconWrapper size={20}>
          <PlusIcon />
        </IconWrapper>
      </IconButton>
    </Container>
  )
}

const Container = styled(HStack)`
  padding: 16px;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
`
