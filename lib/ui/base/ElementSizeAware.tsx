import { Dimensions } from '@lib/utils/entities/Dimensions'
import { ReactNode, useState } from 'react'
import { useIsomorphicLayoutEffect } from 'react-use'

import { useElementSize } from '../hooks/useElementSize'

interface ElementSizeAwareRenderParams {
  size: Dimensions | null
  setElement: (element: HTMLElement | null) => void
}

interface Props {
  render: (params: ElementSizeAwareRenderParams) => ReactNode
  onChange?: (size: Dimensions | null) => void
}

export const ElementSizeAware = ({ render, onChange }: Props) => {
  const [element, setElement] = useState<HTMLElement | null>(null)

  const size = useElementSize(element)

  useIsomorphicLayoutEffect(() => {
    onChange?.(size)
  }, [size])

  return <>{render({ setElement, size })}</>
}
