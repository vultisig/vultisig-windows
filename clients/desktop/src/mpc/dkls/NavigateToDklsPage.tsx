import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useAppNavigate } from '@lib/ui/navigation/hooks/useAppNavigate'
import { ChildrenProp } from '@lib/ui/props'
import { useRef } from 'react'

export const NavigateToDklsPage = ({ children }: ChildrenProp) => {
  const navigate = useAppNavigate()
  const clickCount = useRef(0)

  const handleClick = () => {
    clickCount.current += 1
    if (clickCount.current >= 5) {
      navigate('dkls')
    }
  }

  return <UnstyledButton onClick={handleClick}>{children}</UnstyledButton>
}
