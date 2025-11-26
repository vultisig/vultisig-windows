import { RenderProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { MpcSignersProvider } from '../devices/state/signers'
import { useStartMpcSession } from './useStartMpcSession'

export const SilentStartMpcSessionFlow = ({ render }: RenderProp) => {
  const { mutate: start, data, isSuccess } = useStartMpcSession()

  useEffect(() => {
    start()
  }, [start])

  if (!isSuccess || !data) {
    return null
  }

  return <MpcSignersProvider value={data}>{render()}</MpcSignersProvider>
}
