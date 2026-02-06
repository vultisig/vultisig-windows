import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { FC } from 'react'
import styled from 'styled-components'

import { ToolAction } from './types'

type Props = {
  actions: ToolAction[]
}

export const ActionBar: FC<Props> = ({ actions }) => {
  const { addToast } = useToast()

  if (actions.length === 0) return null

  const handleAction = (action: ToolAction) => {
    if (action.type === 'navigate' && action.navigation) {
      if (window.runtime && 'EventsEmit' in window.runtime) {
        ;(
          window.runtime as unknown as {
            EventsEmit: (event: string, payload: unknown) => void
          }
        ).EventsEmit('agent:navigate', {
          id: action.navigation.id,
          state: action.navigation.state ?? {},
        })
      }
      return
    }

    if (action.type === 'copy' && action.value) {
      navigator.clipboard.writeText(action.value)
      addToast({ message: 'Copied' })
      return
    }

    if (action.type === 'openExternal' && action.url) {
      window.open(action.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <HStack gap={8} style={{ flexWrap: 'wrap' }}>
      {actions.map((action, index) => (
        <ActionButton
          key={`${action.label}-${index}`}
          onClick={() => handleAction(action)}
        >
          {action.label}
        </ActionButton>
      ))}
    </HStack>
  )
}

const ActionButton = styled(UnstyledButton)`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid ${getColor('mist')};
  background: ${getColor('foreground')};
  color: ${getColor('textSupporting')};
  font-size: 12px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: ${getColor('foregroundExtra')};
    border-color: ${getColor('primary')};
  }
`
