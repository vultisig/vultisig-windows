import type { ToolHandler } from '../types'

export const handleSignInStatus: ToolHandler = async (_input, context) => {
  const agentService = window.go?.agent?.AgentService
  if (!agentService) throw new Error('agent service not available')

  const token = await agentService.GetCachedAuthToken(context.vaultPubKey)
  const signedIn = await agentService.GetVerifierSignInStatus(
    context.vaultPubKey
  )

  return {
    data: {
      signed_in: signedIn,
      has_token: !!token,
      message: signedIn
        ? 'Vault is signed in to the verifier'
        : 'Vault is not signed in. Some features may be limited.',
    },
  }
}
