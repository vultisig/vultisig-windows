import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { InstallRequired } from '../state/chatTypes'

type InstallPromptProps = {
  installRequired: InstallRequired
  onInstall: () => void
  onCancel: () => void
}

export const InstallPrompt = ({
  installRequired,
  onInstall,
  onCancel,
}: InstallPromptProps) => {
  return (
    <Container gap={12}>
      <VStack gap={4}>
        <Text size={14} weight={500} color="contrast">
          Plugin Required
        </Text>
        <Text size={12} color="shy">
          {installRequired.description ||
            `Install ${installRequired.title} to continue`}
        </Text>
      </VStack>
      <VStack gap={8}>
        <Button onClick={onInstall}>Install {installRequired.title}</Button>
        <Button kind="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </VStack>
    </Container>
  )
}

const Container = styled(VStack)`
  padding: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`
