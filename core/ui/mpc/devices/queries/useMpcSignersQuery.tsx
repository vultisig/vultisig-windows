import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { pollingQueryOptions } from '@lib/ui/query/utils/options'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { useMpcLocalPartyId } from '../../state/mpcLocalPartyId'

type GetSignersInput = {
  serverUrl: string
  sessionId: string
  localPartyId: string
}

const getSigners = async ({
  serverUrl,
  sessionId,
  localPartyId,
}: GetSignersInput) => {
  const response = await queryUrl<string[]>(`${serverUrl}/${sessionId}`)
  if (response.length === 0) {
    throw new Error('No signers found')
  }

  if (response.length === 1 && response[0] === localPartyId) {
    throw new Error('No other parties present in the MPC session')
  }

  return response
}

export const useMpcSignersQuery = () => {
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const localPartyId = useMpcLocalPartyId()

  const input: GetSignersInput = {
    serverUrl,
    sessionId,
    localPartyId,
  }

  return useQuery({
    queryKey: ['signers', input],
    queryFn: async () => getSigners(input),
    ...pollingQueryOptions(2000),
  })
}
