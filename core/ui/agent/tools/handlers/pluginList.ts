import { formatPluginPricing } from '../shared/formatting'
import { listPlugins } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

export const handlePluginList: ToolHandler = async () => {
  const resp = await listPlugins()

  const plugins = resp.plugins.map(p => {
    const pricingText = formatPluginPricing(p.pricing ?? [])
    return {
      id: p.id,
      title: p.title,
      name: p.title,
      description: p.description,
      categories: p.categories ?? [],
      pricing: pricingText || 'Free',
    }
  })

  return {
    data: {
      plugins,
      total_count: resp.total_count,
      ui: {
        title: 'Available Plugins',
        summary: `${resp.total_count} plugins available`,
      },
    },
  }
}
