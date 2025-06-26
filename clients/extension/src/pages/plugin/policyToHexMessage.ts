import { PluginCreatePolicyProps } from '../../utils/interfaces'

export function policyToMessageHex(
  policy: PluginCreatePolicyProps
): Uint8Array {
  const delimiter = '*#*'

  const fields = [
    policy.recipe,
    policy.publicKey,
    String(policy.policyVersion),
    policy.pluginVersion,
  ]

  for (const item of fields) {
    if (item.includes(delimiter)) {
      throw new Error('invalid policy signature')
    }
  }

  const result = fields.join(delimiter)
  return new TextEncoder().encode(result) // returns Uint8Array
}
