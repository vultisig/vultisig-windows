import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { without } from '@lib/utils/array/without'
import { useCallback } from 'react'

import { useMpcSignersQuery } from '../../queries/queries/useMpcSignersQuery'

export const useMpcPeersQuery = () => {
  const signersQuery = useMpcSignersQuery()

  const localPartyId = useMpcLocalPartyId()

  return useTransformQueryData(
    signersQuery,
    useCallback(signers => without(signers, localPartyId), [localPartyId])
  )
}
