import { Plugin } from '@core/ui/plugins/core/get'
import { OnFinishProp } from '@lib/ui/props'

import { PluginInstallAnimationProvider } from './PluginInstallAnimationProvider'
import { PluginReshareFlowContent } from './PluginReshareFlowContent'

export const PluginReshareFlow = ({
  plugin,
  onFinish,
  onTimeout,
  retryKey,
}: {
  plugin: Plugin
  retryKey: number
} & OnFinishProp<boolean> & { onTimeout?: () => void }) => {
  return (
    <PluginInstallAnimationProvider>
      <PluginReshareFlowContent
        plugin={plugin}
        onFinish={onFinish}
        onTimeout={onTimeout}
        retryKey={retryKey}
      />
    </PluginInstallAnimationProvider>
  )
}
