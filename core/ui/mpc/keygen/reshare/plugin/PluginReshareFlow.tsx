import { Plugin } from '@core/ui/plugins/core/get'

import { PluginInstallAnimationProvider } from './PluginInstallAnimationProvider'
import { PluginReshareFlowContent } from './PluginReshareFlowContent'

export const PluginReshareFlow = ({ plugin }: { plugin: Plugin }) => {
  return (
    <PluginInstallAnimationProvider>
      <PluginReshareFlowContent plugin={plugin} />
    </PluginInstallAnimationProvider>
  )
}
