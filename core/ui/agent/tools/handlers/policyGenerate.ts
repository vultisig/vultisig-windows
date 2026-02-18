import { convertToSmallestUnit, resolveAsset } from '../shared/assetResolution'
import { getPluginName, resolvePluginId } from '../shared/pluginConfig'
import { enrichPolicyFields } from '../shared/policyHelpers'
import type { ToolHandler } from '../types'
import type { CoinInfo } from '../types'

const sendsPluginId = 'vultisig-recurring-sends-0000'

function findVaultAddress(coins: CoinInfo[], chain: string): string {
  const lowerChain = chain.toLowerCase()
  const native = coins.find(
    c => c.chain.toLowerCase() === lowerChain && c.isNativeToken
  )
  if (native) return native.address
  const any = coins.find(c => c.chain.toLowerCase() === lowerChain)
  return any?.address ?? ''
}

function immediateStartDate(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 1, 0, 0)
  return d.toISOString()
}

function buildSendsConfig(
  input: Record<string, unknown>,
  coins: CoinInfo[]
): Record<string, unknown> {
  const config: Record<string, unknown> = { startDate: immediateStartDate() }

  let fromAsset: ReturnType<typeof resolveAsset> = null
  if (input.from_asset) {
    fromAsset = resolveAsset(String(input.from_asset))
  }

  if (fromAsset) {
    const assetObj: Record<string, unknown> = {
      chain: fromAsset.chain,
      token: fromAsset.isNative ? '' : fromAsset.tokenAddress,
      address: findVaultAddress(coins, fromAsset.chain),
    }
    config.asset = assetObj
  }

  const recipient: Record<string, unknown> = {}
  if (input.to_address) {
    recipient.toAddress = String(input.to_address)
  }
  if (input.amount) {
    let amountStr = String(input.amount)
    if (fromAsset && fromAsset.decimals > 0) {
      amountStr = convertToSmallestUnit(amountStr, fromAsset.decimals)
    }
    recipient.amount = amountStr
  }
  config.recipients = [recipient]

  return config
}

function buildSwapConfig(
  input: Record<string, unknown>,
  coins: CoinInfo[]
): Record<string, unknown> {
  const config: Record<string, unknown> = { startDate: immediateStartDate() }

  let fromAsset: ReturnType<typeof resolveAsset> = null
  if (input.from_asset) {
    fromAsset = resolveAsset(String(input.from_asset))
    if (fromAsset) {
      const fromObj: Record<string, unknown> = {
        chain: fromAsset.chain,
        token: fromAsset.isNative ? '' : fromAsset.tokenAddress,
        address: findVaultAddress(coins, fromAsset.chain),
      }
      config.from = fromObj
    }
  }

  if (input.to_asset) {
    const toAsset = resolveAsset(String(input.to_asset))
    if (toAsset) {
      const toObj: Record<string, unknown> = {
        chain: toAsset.chain,
        token: toAsset.isNative ? '' : toAsset.tokenAddress,
        address: findVaultAddress(coins, toAsset.chain),
      }
      if (input.to_address) {
        toObj.address = input.to_address
      }
      config.to = toObj
    }
  } else if (input.to_address) {
    let toChain = ''
    if (fromAsset) toChain = fromAsset.chain
    if (input.to_chain) toChain = String(input.to_chain)
    config.to = { address: String(input.to_address), chain: toChain }
  }

  if (input.amount) {
    let amountStr = String(input.amount)
    if (fromAsset && fromAsset.decimals > 0) {
      amountStr = convertToSmallestUnit(amountStr, fromAsset.decimals)
    }
    config.fromAmount = amountStr
  }

  return config
}

export const handlePolicyGenerate: ToolHandler = async (input, context) => {
  const pluginIdRaw = String(input.plugin_id ?? '').trim()
  if (!pluginIdRaw) throw new Error('plugin_id is required')

  const pluginId = resolvePluginId(pluginIdRaw)

  let config: Record<string, unknown>
  if (pluginId === sendsPluginId) {
    config = buildSendsConfig(input, context.coins)
  } else {
    config = buildSwapConfig(input, context.coins)
  }

  if (input.frequency) {
    config.frequency = input.frequency
  }

  const configJson = JSON.stringify(config, null, 2)

  const result: Record<string, unknown> = {
    plugin_id: pluginId,
    plugin_name: getPluginName(pluginId),
    configuration: config,
    config_json: configJson,
    message: 'Policy configuration generated. Ready for review.',
    ui: {
      title: 'Policy Preview',
      summary: 'Review configuration before creating policy',
      actions: [{ type: 'copy', label: 'Copy Config JSON', value: configJson }],
    },
  }

  enrichPolicyFields(result, config)

  if (input.amount) {
    result.amount = String(input.amount)
  }
  if (config.frequency) {
    result.frequency = String(config.frequency)
  }

  return { data: result }
}
