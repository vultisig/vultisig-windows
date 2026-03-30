import { useMpcDevices } from '@core/ui/mpc/state/mpcDevices'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { useMutation } from '@tanstack/react-query'
import { startMpcSession } from '@vultisig/core-mpc/session/startMpcSession'

export const useStartMpcSession = (onSuccess?: (devices: string[]) => void) => {
  const sessionId = useMpcSessionId()
  const serverUrl = useMpcServerUrl()
  const devices = useMpcDevices()

  return useMutation({
    mutationFn: async () => {
      await startMpcSession({
        serverUrl,
        sessionId,
        devices,
      })
      return devices
    },
    onSuccess,
  })
}
