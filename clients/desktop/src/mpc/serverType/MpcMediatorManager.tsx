import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useMpcServiceName } from '@core/ui/mpc/state/mpcServiceName'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  AdvertiseMediator,
  StopAdvertiseMediator,
} from '../../../wailsjs/go/mediator/Server'

export const MpcMediatorManager = () => {
  const serviceName = useMpcServiceName()
  const [serverType] = useMpcServerType()

  const { mutate: start } = useMutation({
    mutationFn: async () => AdvertiseMediator(serviceName),
  })

  const { mutate: stop } = useMutation({
    mutationFn: async () => StopAdvertiseMediator(),
  })

  useEffect(() => {
    if (serverType === 'local') {
      start()

      return () => {
        stop()
      }
    }
  }, [serverType, start, stop])

  // TODO: Show failure to advertise mediator on the UI

  return null
}
