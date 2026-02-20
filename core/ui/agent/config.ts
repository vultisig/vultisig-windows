declare const __AGENT_BACKEND_URL__: string | undefined
declare const __VULTISIG_VERIFIER_URL__: string | undefined

export const agentBackendUrl =
  typeof __AGENT_BACKEND_URL__ !== 'undefined'
    ? __AGENT_BACKEND_URL__
    : 'https://agent-backend.vultisig.com'

export const verifierUrl =
  typeof __VULTISIG_VERIFIER_URL__ !== 'undefined'
    ? __VULTISIG_VERIFIER_URL__
    : 'https://verifier.vultisig.com'
