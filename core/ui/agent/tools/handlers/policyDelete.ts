import { ethereumSignHash } from '../shared/ethereumSigning'
import {
  fastVaultKeysign,
  formatKeysignSignatureHex,
} from '../shared/fastVaultKeysign'
import { deletePolicy, getPolicyFull } from '../shared/verifierApi'
import type { ToolHandler } from '../types'

const deleteDerivePath = "m/44'/60'/0'/0/0"

export const handlePolicyDelete: ToolHandler = async (input, context) => {
  const vault = context.vault
  if (!vault) {
    throw new Error('Vault metadata required for policy deletion')
  }

  const policyId = input.policy_id as string
  if (!policyId) throw new Error('policy_id is required')

  const authToken = context.authToken ?? ''

  const policyDetails = await getPolicyFull(policyId, authToken)

  const pluginVersion =
    ((policyDetails as Record<string, unknown>).plugin_version as string) ||
    '1.0.0'

  const policyVersion =
    ((policyDetails as Record<string, unknown>).policy_version as number) ?? 0

  const recipe = policyDetails.recipe ?? ''

  const messageToSign = `${recipe}*#*${policyDetails.public_key}*#*${policyVersion}*#*${pluginVersion}`

  const messageHash = ethereumSignHash(messageToSign)
  const keysignResult = await fastVaultKeysign({
    vault,
    messageHash,
    derivePath: deleteDerivePath,
  })
  const signature = formatKeysignSignatureHex(keysignResult)

  await deletePolicy(policyId, signature, authToken)

  return {
    data: {
      success: true,
      policy_id: policyId,
      message: `Policy ${policyId} deleted successfully.`,
      ui: {
        title: 'Policy Deleted',
        actions: [{ type: 'copy', label: 'Copy Policy ID', value: policyId }],
      },
    },
  }
}
