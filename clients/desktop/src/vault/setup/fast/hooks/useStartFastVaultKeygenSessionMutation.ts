import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { startSession } from '../../../keygen/utils/startSession'

export const useStartFastVaultKeygenSessionMutation = (enabled: boolean) => {
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const localPartyId = useMpcLocalPartyId()
  const devices = [localPartyId, ...useMpcPeers()]

  const { mutate: start, ...state } = useMutation({
    mutationFn: () => {
      return startSession({ serverUrl, sessionId, devices })
    },
  })

  useEffect(() => {
    if (enabled) start()
  }, [enabled, start])

  return state
}
