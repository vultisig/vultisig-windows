import { without } from '@lib/utils/array/without'
import { useCallback } from 'react'

import { useTransformQueryData } from '../../../../lib/ui/query/hooks/useTransformQueryData'
import { useCurrentLocalPartyId } from '../../state/currentLocalPartyId'
import { useKeygenSignersQuery } from './useKeygenSignersQuery'

export const useKeygenPeersQuery = () => {
  const signersQuery = useKeygenSignersQuery()

  const localPartyId = useCurrentLocalPartyId()

  return useTransformQueryData(
    signersQuery,
    useCallback(signers => without(signers, localPartyId), [localPartyId])
  )
}
