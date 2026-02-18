type PluginInfo = {
  id: string
  aliases: string[]
  name: string
  serverUrl: string
}

const knownPlugins: PluginInfo[] = [
  {
    id: 'vultisig-dca-0000',
    aliases: ['dca', 'recurring-swaps'],
    name: 'Recurring Swaps (DCA)',
    serverUrl: 'https://plugin-dca-swap.prod.plugins.vultisig.com',
  },
  {
    id: 'vultisig-fees-feee',
    aliases: ['fee', 'fees'],
    name: 'Vultisig Fees',
    serverUrl: 'https://plugin-fees.prod.plugins.vultisig.com',
  },
  {
    id: 'vultisig-recurring-sends-0000',
    aliases: ['sends', 'recurring-sends'],
    name: 'Recurring Sends',
    serverUrl: 'https://plugin-dca-send.prod.plugins.vultisig.com',
  },
]

const pluginAliasMap: Record<string, string> = {}
for (const p of knownPlugins) {
  for (const alias of p.aliases) {
    pluginAliasMap[alias.toLowerCase()] = p.id
  }
}

export function resolvePluginId(input: string): string {
  const lower = input.toLowerCase()
  return pluginAliasMap[lower] ?? input
}

export function getPluginName(pluginIdOrAlias: string): string {
  const id = resolvePluginId(pluginIdOrAlias)
  const plugin = knownPlugins.find(p => p.id === id)
  return plugin?.name ?? id
}

export function getPluginServerUrl(pluginIdOrAlias: string): string {
  const id = resolvePluginId(pluginIdOrAlias)
  const plugin = knownPlugins.find(p => p.id === id)
  return plugin?.serverUrl ?? ''
}

export { knownPlugins }
export type { PluginInfo }
