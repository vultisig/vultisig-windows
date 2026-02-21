import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceBoolean,
} from '@rive-app/react-webgl2'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { InstallPluginStep } from '../plugin/InstallPluginStep'

type DeviceKey =
  | 'device1Connected'
  | 'device2Connected'
  | 'device3Connected'
  | 'appInstalled'

const stateMachineName = 'State Machine 1'
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mapInstallPluginStepToDeviceKey: Record<
  Exclude<InstallPluginStep, 'fastServer'>,
  DeviceKey
> = {
  verifierServer: 'device1Connected',
  pluginServer: 'device2Connected',
  install: 'device3Connected',
  finishInstallation: 'appInstalled',
}

const deviceOrder: DeviceKey[] = [
  'device1Connected',
  'device2Connected',
  'device3Connected',
  'appInstalled',
]

export const usePluginReshareStepsAnimations = () => {
  const mountedRef = useRef(true)
  const opIdRef = useRef(0)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const [status, setStatus] = useState<Record<DeviceKey, boolean>>({
    device1Connected: false,
    device2Connected: false,
    device3Connected: false,
    appInstalled: false,
  })

  const statusRef = useRef(status)
  statusRef.current = status

  const { rive, RiveComponent } = useRive({
    src: '/core/animations/app_install_overview.riv',
    stateMachines: stateMachineName,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  })

  const viewModel = useViewModel(rive, { useDefault: true })

  const viewModelInstance = useViewModelInstance(viewModel, {
    useDefault: true,
    rive,
  })

  const device1 = useViewModelInstanceBoolean(
    'device1Connected',
    viewModelInstance
  )
  const device2 = useViewModelInstanceBoolean(
    'device2Connected',
    viewModelInstance
  )
  const device3 = useViewModelInstanceBoolean(
    'device3Connected',
    viewModelInstance
  )
  const appInstalled = useViewModelInstanceBoolean(
    'appInstalled',
    viewModelInstance
  )

  useEffect(() => {
    if (!rive) return

    const id = window.setInterval(() => {
      if (rive && !rive.isPlaying) {
        rive.play()
      }
    }, 100)

    return () => window.clearInterval(id)
  }, [rive])

  useEffect(() => {
    if (!rive) return
    rive.resizeDrawingSurfaceToCanvas()
    const onResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [rive])

  const setMap = useMemo(
    () => ({
      device1Connected: device1.setValue,
      device2Connected: device2.setValue,
      device3Connected: device3.setValue,
      appInstalled: appInstalled.setValue,
    }),
    [
      device1.setValue,
      device2.setValue,
      device3.setValue,
      appInstalled.setValue,
    ]
  )

  const connectDevice = useCallback(
    (device: DeviceKey) => {
      setStatus(prev => ({ ...prev, [device]: true }))
      setMap[device](true)
    },
    [setMap]
  )

  const updateStatus = useCallback(
    async (
      step: Exclude<InstallPluginStep, 'fastServer'>,
      connected: boolean
    ) => {
      opIdRef.current += 1
      const currentOpId = opIdRef.current

      const targetDevice = mapInstallPluginStepToDeviceKey[step]

      const targetIndex = deviceOrder.indexOf(targetDevice)

      if (targetIndex === -1) {
        return
      }

      if (!connected) {
        setStatus(prev => ({ ...prev, [targetDevice]: false }))
        setMap[targetDevice](false)
        return
      }

      for (let i = 0; i < targetIndex; i++) {
        if (currentOpId !== opIdRef.current) return
        if (!mountedRef.current) return

        const previousDevice = deviceOrder[i]
        if (!statusRef.current[previousDevice]) {
          if (currentOpId !== opIdRef.current) return
          connectDevice(previousDevice)
          await delay(1000)
          if (currentOpId !== opIdRef.current) return
          if (!mountedRef.current) return
        }
      }
      if (currentOpId !== opIdRef.current) return
      if (!mountedRef.current) return
      connectDevice(targetDevice)
    },
    [connectDevice, setMap]
  )

  return {
    animationComponent: RiveComponent,
    updateStatus,
  }
}
