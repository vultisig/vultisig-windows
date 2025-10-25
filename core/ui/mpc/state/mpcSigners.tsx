import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { without } from '@lib/utils/array/without'
import { useMemo } from 'react'

import { useMpcLocalPartyId } from './mpcLocalPartyId'

export const { useValue: useMpcSigners, provider: MpcSignersProvider } =
  getValueProviderSetup<string[]>('MpcSigners')

export const useMpcPeers = () => {
  const signers = useMpcSigners()
  const localPartyId = useMpcLocalPartyId()

  return useMemo(() => without(signers, localPartyId), [signers, localPartyId])
}
