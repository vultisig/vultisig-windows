import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useMpcServerUrl } from '../../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../../mpc/session/state/mpcSession'
import { startSession } from '../../../keygen/utils/startSession'
import { useVaultKeygenDevices } from '../../hooks/useVaultKegenDevices'

export const useStartFastVaultKeygenSessionMutation = (enabled: boolean) => {
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const devices = useVaultKeygenDevices()

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
