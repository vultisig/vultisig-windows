import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { without } from '@lib/utils/array/without'
import { useCallback } from 'react'

import { useMpcLocalPartyId } from '../../localPartyId/state/mpcLocalPartyId'
import { useMpcSignersQuery } from '../../signers/queries/useMpcSignersQuery'

export const useMpcPeersQuery = () => {
  const signersQuery = useMpcSignersQuery()

  const localPartyId = useMpcLocalPartyId()

  return useTransformQueryData(
    signersQuery,
    useCallback(signers => without(signers, localPartyId), [localPartyId])
  )
}
