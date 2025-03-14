import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useMpcPeers } from '../../../../mpc/peers/state/mpcPeers'
import { useMpcServerUrl } from '../../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { startSession } from '../../../keygen/utils/startSession'

export const useStartFastVaultKeygenSessionMutation = (enabled: boolean) => {
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const devices = useMpcPeers()

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
