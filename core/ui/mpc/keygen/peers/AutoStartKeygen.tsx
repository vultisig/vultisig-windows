import { useTargetDeviceCount } from '@core/ui/mpc/keygen/state/targetDeviceCount'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { OnFinishProp } from '@lib/ui/props'
import { useEffect, useRef } from 'react'

export const AutoStartKeygen = ({ onFinish }: OnFinishProp) => {
  const selectedPeers = useMpcPeers()
  const targetDeviceCount = useTargetDeviceCount()
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (hasStartedRef.current) return
    if (targetDeviceCount === undefined || targetDeviceCount > 3) return

    const requiredPeers = targetDeviceCount - 1
    if (selectedPeers.length !== requiredPeers) return

    hasStartedRef.current = true
    onFinish()
  }, [selectedPeers.length, targetDeviceCount, onFinish])

  return null
}
