import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { FC } from 'react'
import styled from 'styled-components'

type CopyButtonProps = {
  value: string
  label?: string
}

export const CopyButton: FC<CopyButtonProps> = ({
  value,
  label = 'Copied',
}) => {
  const { addToast } = useToast()

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(value)
    addToast({ message: label })
  }

  return (
    <StyledCopyButton onClick={handleCopy}>
      <ClipboardCopyIcon />
    </StyledCopyButton>
  )
}

const StyledCopyButton = styled(UnstyledButton)`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};

  font-size: 14px;
  color: ${getColor('textShy')};
  padding: 4px;
  min-width: 24px;
  min-height: 24px;
  cursor: pointer;
  transition: color 0.2s ease;
  border-radius: 4px;

  &:hover {
    color: ${getColor('textSupporting')};
    background: ${getColor('mist')};
  }

  &:active {
    color: ${getColor('contrast')};
  }
`
