import { ReactNode } from 'react'

import { useBoolean } from '../hooks/useBoolean'

type RenderParams = {
  src: string
  onError: () => void
}

type Props = {
  src?: string
  fallback?: ReactNode
  render: (params: RenderParams) => void
}

export const SafeImage = ({ fallback = null, src, render }: Props) => {
  const [isFailedToLoad, { set: failedToLoad }] = useBoolean(false)

  return (
    <>
      {isFailedToLoad || !src
        ? fallback
        : render({ onError: failedToLoad, src })}
    </>
  )
}
