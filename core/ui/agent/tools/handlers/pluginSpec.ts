import { formatPluginPricing } from '../shared/formatting'
import { resolvePluginId } from '../shared/pluginConfig'
import { getPlugin, getRecipeSpecification } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

export const handlePluginSpec: ToolHandler = async input => {
  const pluginIdRaw = String(input.plugin_id ?? '').trim()
  if (!pluginIdRaw) throw new Error('plugin_id is required')

  const pluginId = resolvePluginId(pluginIdRaw)
  const [spec, plugin] = await Promise.all([
    getRecipeSpecification(pluginId),
    getPlugin(pluginId),
  ])

  const pricingText = formatPluginPricing(plugin.pricing ?? [])

  return {
    data: {
      plugin_id: pluginId,
      plugin_name: plugin.title,
      description: spec.description,
      configuration_schema: spec.configuration_schema,
      configuration_example: spec.configuration_example ?? null,
      supported_chains: spec.supported_chains ?? [],
      supported_assets: spec.supported_assets ?? [],
      required_fields: spec.required_fields ?? [],
      pricing: pricingText || 'Free',
      ui: {
        title: 'Plugin Details',
        summary: spec.description,
        actions: [{ type: 'copy', label: 'Copy Plugin ID', value: pluginId }],
      },
    },
  }
}
