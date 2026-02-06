import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode, useState } from 'react'
import styled from 'styled-components'

type Props = {
  title?: string
  children: ReactNode
  defaultOpen?: boolean
}

export const DetailsDrawer: FC<Props> = ({
  title = 'Details',
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Container>
      <ToggleButton onClick={() => setOpen(prev => !prev)}>
        <HStack
          gap={8}
          alignItems="center"
          justifyContent="space-between"
          fullWidth
        >
          <Text size={12} weight={600} color="supporting">
            {title}
          </Text>
          <ExpandIcon $expanded={open}>▸</ExpandIcon>
        </HStack>
      </ToggleButton>
      {open && <Content>{children}</Content>}
    </Container>
  )
}

const Container = styled(VStack)`
  gap: 8px;
  border: 1px solid ${getColor('mist')};
  border-radius: 8px;
  background: ${getColor('background')};
  overflow: hidden;
`

const ToggleButton = styled(UnstyledButton)`
  width: 100%;
  padding: 8px 10px;
  cursor: pointer;
  background: ${getColor('foreground')};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const ExpandIcon = styled.span<{ $expanded: boolean }>`
  font-size: 10px;
  color: ${getColor('textSupporting')};
  transform: rotate(${({ $expanded }) => ($expanded ? '90deg' : '0deg')});
  transition: transform 0.2s ease;
`

const Content = styled.div`
  padding: 0 10px 10px;
`
