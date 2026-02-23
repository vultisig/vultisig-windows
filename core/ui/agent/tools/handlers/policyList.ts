import {
  getPluginName,
  knownPlugins,
  resolvePluginId,
} from '../shared/pluginConfig'
import { enrichPolicyFields } from '../shared/policyHelpers'
import type { Policy } from '../shared/verifierApi'
import { getPolicyFull, listPolicies } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

function resolveConfiguration(
  p: Policy,
  authToken: string
): Promise<Record<string, unknown>> {
  if (p.configuration && Object.keys(p.configuration).length > 0) {
    return Promise.resolve(p.configuration)
  }

  return getPolicyFull(p.id, authToken)
    .then(full => {
      if (full.configuration && Object.keys(full.configuration).length > 0) {
        return full.configuration
      }
      return {}
    })
    .catch(() => ({}))
}

export const handlePolicyList: ToolHandler = async (input, context) => {
  const active = input.active !== false

  let pluginIds: string[]
  if (input.plugin_id) {
    pluginIds = [resolvePluginId(String(input.plugin_id))]
  } else {
    pluginIds = knownPlugins.map(p => p.id)
  }

  const allPolicies: Record<string, unknown>[] = []
  const errors: string[] = []

  for (const pluginId of pluginIds) {
    try {
      const resp = await listPolicies(
        pluginId,
        context.vaultPubKey,
        context.authToken ?? '',
        active
      )
      for (const p of resp.policies) {
        const config = await resolveConfiguration(p, context.authToken ?? '')

        const policy: Record<string, unknown> = {
          id: p.id,
          plugin_id: p.plugin_id,
          plugin_name: getPluginName(p.plugin_id),
          active: p.active,
          configuration: config,
          created_at: p.created_at,
        }
        enrichPolicyFields(policy, config)
        allPolicies.push(policy)
      }
    } catch (err) {
      errors.push(
        `${getPluginName(pluginId)}: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  if (allPolicies.length === 0 && errors.length === pluginIds.length) {
    throw new Error(`Failed to list policies: ${errors.join('; ')}`)
  }

  return {
    data: {
      policies: allPolicies,
      total_count: allPolicies.length,
      ui: {
        title: 'Policies',
        summary: `${allPolicies.length} policies found`,
      },
    },
  }
}
