import { create, type JsonObject, toBinary } from '@bufbuild/protobuf'
import { PolicySchema } from '@core/mpc/types/plugin/policy_pb'
import type { Rule } from '@core/mpc/types/plugin/rule_pb'

import { ethereumSignHash } from '../shared/ethereumSigning'
import {
  fastVaultKeysign,
  formatKeysignSignatureHex,
} from '../shared/fastVaultKeysign'
import { getPluginName, resolvePluginId } from '../shared/pluginConfig'
import { enrichPolicyFields } from '../shared/policyHelpers'
import {
  addPolicy,
  type AppPricing,
  getPlugin,
  suggestPolicy,
} from '../shared/verifierApi'
import type { ToolHandler } from '../types'

const policyDerivePath = "m/44'/60'/0'/0/0"

function normalizeBilling(raw: unknown): unknown[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object') return [raw]
  return []
}

function resolveVersionFromPlugin(
  plugin: {
    version?: string
    plugin_version?: string
  } | null
): string {
  const fallback = '1.0.0'
  if (!plugin) return fallback
  return plugin.version || plugin.plugin_version || fallback
}

function billingFromPricing(pricing: AppPricing[]): unknown[] {
  return pricing
    .filter(p => p.amount > 0)
    .map(p => {
      const entry: Record<string, unknown> = {
        amount: p.amount,
        asset: p.asset,
      }
      if (p.type) entry.type = p.type
      if (p.frequency) entry.frequency = p.frequency
      return entry
    })
}

function buildProtobufRecipe(
  pluginId: string,
  config: Record<string, unknown>,
  suggest: {
    rules?: unknown[]
    rate_limit_window?: number
    max_txs_per_window?: number
  }
): string {
  const policy = create(PolicySchema, {
    id: pluginId,
    configuration: config as JsonObject,
    rules: (suggest.rules ?? []) as Rule[],
    rateLimitWindow: suggest.rate_limit_window,
    maxTxsPerWindow: suggest.max_txs_per_window,
  })

  const bytes = toBinary(PolicySchema, policy)
  return btoa(String.fromCharCode(...bytes))
}

export const handlePolicyAdd: ToolHandler = async (input, context) => {
  const vault = context.vault
  if (!vault) {
    throw new Error('Vault metadata required for policy creation')
  }

  const pluginIdRaw = input.plugin_id as string
  if (!pluginIdRaw) throw new Error('plugin_id is required')

  const config = input.configuration as Record<string, unknown>
  if (!config) throw new Error('configuration is required')

  const pluginId = resolvePluginId(pluginIdRaw)
  let billing = normalizeBilling(input.billing)

  let plugin: Awaited<ReturnType<typeof getPlugin>> | null = null
  try {
    plugin = await getPlugin(pluginId)
  } catch {
    // plugin fetch is best-effort
  }

  if (billing.length === 0 && plugin?.pricing && plugin.pricing.length > 0) {
    billing = billingFromPricing(plugin.pricing)
  }

  const suggest = await suggestPolicy(pluginId, config)

  const recipeBase64 = buildProtobufRecipe(pluginId, config, suggest)

  const policyVersion = 0
  const pluginVersion = resolveVersionFromPlugin(plugin)
  const messageToSign = `${recipeBase64}*#*${context.vaultPubKey}*#*${policyVersion}*#*${pluginVersion}`

  const messageHash = ethereumSignHash(messageToSign)
  const keysignResult = await fastVaultKeysign({
    vault,
    messageHash,
    derivePath: policyDerivePath,
  })
  const signature = formatKeysignSignatureHex(keysignResult)

  const resp = await addPolicy(
    {
      pluginId,
      publicKey: context.vaultPubKey,
      pluginVersion,
      policyVersion,
      signature,
      recipe: recipeBase64,
      billing,
      active: true,
    },
    context.authToken ?? ''
  )

  const result: Record<string, unknown> = {
    success: true,
    policy_id: resp.id,
    plugin_id: pluginId,
    plugin_name: getPluginName(pluginId),
    message: `Policy created successfully (ID: ${resp.id}).`,
    ui: {
      title: 'Policy Created',
      actions: [{ type: 'copy', label: 'Copy Policy ID', value: resp.id }],
    },
  }

  enrichPolicyFields(result, config)

  return { data: result }
}
