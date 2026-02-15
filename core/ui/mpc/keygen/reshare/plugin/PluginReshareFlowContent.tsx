import { PreviewInfo } from '@core/ui/mpc/keygen/reshare/plugin/PreviewInfo'
import { Plugin } from '@core/ui/plugins/core/get'
import { PasswordProvider } from '@core/ui/state/password'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnFinishProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback } from 'react'

import { InstallPluginPendingState } from './InstallPluginPendingState'
import { usePluginInstallAnimation } from './PluginInstallAnimationProvider'
import { PluginReshareFlowSteps } from './PluginReshareFlowSteps'

const closePopupDelay = 1200

export const PluginReshareFlowContent = ({
  plugin,
  onFinish: onFinishProp,
  onTimeout,
  retryKey,
}: {
  plugin: Plugin
  retryKey: number
} & OnFinishProp<boolean> & { onTimeout?: () => void }) => {
  const animationContext = usePluginInstallAnimation()

  const onFinish = useCallback(async () => {
    const context = shouldBePresent(animationContext)
    context.setCurrentStep('finishInstallation')
    await new Promise(resolve => setTimeout(resolve, closePopupDelay))
    onFinishProp(true)
  }, [animationContext, onFinishProp])

  return (
    <>
      <InstallPluginPendingState />
      <ValueTransfer<{ password: string }>
        key="password"
        from={({ onFinish }) => (
          <PreviewInfo value={plugin} onFinish={onFinish} />
        )}
        to={({ value: { password } }) => (
          <PasswordProvider initialValue={password}>
            <PluginReshareFlowSteps
              key={retryKey}
              retryNumber={retryKey}
              password={password}
              plugin={plugin}
              onFinish={onFinish}
              onTimeout={onTimeout}
            />
          </PasswordProvider>
        )}
      />
    </>
  )
}
