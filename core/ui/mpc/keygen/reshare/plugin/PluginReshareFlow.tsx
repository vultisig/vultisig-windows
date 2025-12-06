import { Plugin } from '@core/ui/plugins/core/get'
import { OnFinishProp } from '@lib/ui/props'

import { PluginInstallAnimationProvider } from './PluginInstallAnimationProvider'
import { PluginReshareFlowContent } from './PluginReshareFlowContent'

export const PluginReshareFlow = ({
  plugin,
  onFinish,
}: { plugin: Plugin } & OnFinishProp<boolean>) => {
  return (
    <PluginInstallAnimationProvider>
      <PluginReshareFlowContent plugin={plugin} onFinish={onFinish} />
    </PluginInstallAnimationProvider>
  )
}
