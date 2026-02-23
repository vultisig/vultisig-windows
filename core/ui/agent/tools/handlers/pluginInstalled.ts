import { getPluginName, resolvePluginId } from '../shared/pluginConfig'
import { checkPluginInstalled } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

export const handlePluginInstalled: ToolHandler = async (input, context) => {
  const pluginIdRaw = String(input.plugin_id ?? '').trim()
  if (!pluginIdRaw) throw new Error('plugin_id is required')

  const pluginId = resolvePluginId(pluginIdRaw)
  const pluginName = getPluginName(pluginId)
  if (!context.vaultPubKey) {
    throw new Error('Vault public key is required to check plugin status.')
  }
  if (!context.authToken) {
    throw new Error(
      'Vault is not signed in. Please sign in to check plugin status.'
    )
  }
  const installed = await checkPluginInstalled(
    pluginId,
    context.vaultPubKey,
    context.authToken
  )

  return {
    data: {
      plugin_id: pluginId,
      plugin_name: pluginName,
      installed,
      message: installed
        ? `Plugin ${pluginName} is installed for this vault.`
        : `Plugin ${pluginName} is not installed.`,
      ui: {
        title: 'Plugin Status',
        actions: [{ type: 'copy', label: 'Copy Plugin ID', value: pluginId }],
      },
    },
  }
}
