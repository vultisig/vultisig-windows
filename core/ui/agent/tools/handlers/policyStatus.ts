import { getPluginName } from '../shared/pluginConfig'
import {
  computeNextExecution,
  enrichPolicyFields,
} from '../shared/policyHelpers'
import { getPolicyFull } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

export const handlePolicyStatus: ToolHandler = async (input, context) => {
  const policyId = String(input.policy_id ?? '').trim()
  if (!policyId) throw new Error('policy_id is required')

  const policy = await getPolicyFull(policyId, context.authToken ?? '')
  const config = policy.configuration ?? {}

  const result: Record<string, unknown> = {
    policy_id: policy.id,
    plugin_id: policy.plugin_id,
    plugin_name: getPluginName(policy.plugin_id),
    active: policy.active,
    configuration: config,
    created_at: policy.created_at,
  }

  enrichPolicyFields(result, config)

  if (policy.active) {
    const freq = result.frequency as string | undefined
    const nextExec = computeNextExecution(policy.created_at, freq ?? '')
    if (nextExec) {
      result.next_execution = nextExec
    }
  }

  return { data: result }
}
