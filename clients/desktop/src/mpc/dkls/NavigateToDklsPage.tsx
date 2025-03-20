import { ChildrenProp } from '@lib/ui/props'
import { useRef } from 'react'

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

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
