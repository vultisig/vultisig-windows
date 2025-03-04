import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  AdvertiseMediator,
  StopAdvertiseMediator,
} from '../../../../../wailsjs/go/mediator/Server'
import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { useCurrentServiceName } from '../state/currentServiceName'

export const MediatorManager = () => {
  const serviceName = useCurrentServiceName()
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
