import type { ToolHandler } from '../types'

export const handleSignInStatus: ToolHandler = async (_input, context) => {
  const signedIn = !!context.authToken

  return {
    data: {
      signed_in: signedIn,
      has_token: signedIn,
      message: signedIn
        ? 'Vault is signed in to the verifier'
        : 'Vault is not signed in. Some features may be limited.',
    },
  }
}
