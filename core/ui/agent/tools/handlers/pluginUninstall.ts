import { getPluginName, resolvePluginId } from '../shared/pluginConfig'
import { uninstallPlugin } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

export const handlePluginUninstall: ToolHandler = async (input, context) => {
  const pluginIdRaw = String(input.plugin_id ?? '').trim()
  if (!pluginIdRaw) throw new Error('plugin_id is required')

  const pluginId = resolvePluginId(pluginIdRaw)
  const pluginName = getPluginName(pluginId)

  await uninstallPlugin(pluginId, context.authToken ?? '')

  return {
    data: {
      success: true,
      plugin_id: pluginId,
      plugin_name: pluginName,
      message: `Plugin ${pluginName} uninstalled successfully.`,
      ui: {
        title: 'Plugin Uninstalled',
        actions: [{ type: 'copy', label: 'Copy Plugin ID', value: pluginId }],
      },
    },
  }
}
