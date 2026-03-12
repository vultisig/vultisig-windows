import { create, fromJson, type JsonValue, toBinary } from '@bufbuild/protobuf'
import { PolicySchema } from '@core/mpc/types/plugin/policy_pb'
import { RuleSchema } from '@core/mpc/types/plugin/rule_pb'

import { PolicySuggestData } from '../state/chatTypes'

type EncodePolicyInput = {
  policySuggest: PolicySuggestData
  configuration: Record<string, unknown>
  publicKey: string
  pluginId: string
  policyVersion?: number
  pluginVersion?: number
}

type EncodePolicyResult = {
  recipe: string
  signingMessage: string
  policyId: string
}

export const encodePolicy = ({
  policySuggest,
  configuration,
  publicKey,
  pluginId,
  policyVersion = 1,
  pluginVersion = 1,
}: EncodePolicyInput): EncodePolicyResult => {
  const policyId = crypto.randomUUID()

  const policy = create(PolicySchema, {
    id: pluginId,
    name: `Policy for ${pluginId}`,
    description: 'Auto-generated policy from chat',
    version: policyVersion,
    author: publicKey,
    rules: policySuggest.rules.map(rule =>
      fromJson(RuleSchema, rule as JsonValue)
    ),
    configuration: configuration as any,
    rateLimitWindow: policySuggest.rateLimitWindow,
    maxTxsPerWindow: policySuggest.maxTxsPerWindow,
  })

  const binary = toBinary(PolicySchema, policy)
  const recipe = btoa(String.fromCharCode(...binary))

  const signingMessage = [
    recipe,
    publicKey,
    String(policyVersion),
    String(pluginVersion),
  ].join('*#*')

  return { recipe, signingMessage, policyId }
}
