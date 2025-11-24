import { PluginInstallAnimationProvider } from './PluginInstallAnimationProvider'
import { PluginReshareFlowContent } from './PluginReshareFlowContent'

export const PluginReshareFlow = ({
  description,
  name,
}: {
  description: string
  name: string
}) => {
  return (
    <PluginInstallAnimationProvider>
      <PluginReshareFlowContent description={description} name={name} />
    </PluginInstallAnimationProvider>
  )
}
