// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __AGENT_BACKEND_URL__: string | undefined
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __VULTISIG_VERIFIER_URL__: string | undefined

export const agentBackendUrl =
  typeof __AGENT_BACKEND_URL__ !== 'undefined'
    ? __AGENT_BACKEND_URL__
    : 'https://agent.vultisig.com'

export const verifierUrl =
  typeof __VULTISIG_VERIFIER_URL__ !== 'undefined'
    ? __VULTISIG_VERIFIER_URL__
    : 'https://verifier.vultisig.com'

export const relayUrl = 'https://api.vultisig.com/router'

export const agentInstructions = [
  'Prefer using your knowledge and conversation context over calling tools. Only call a tool when you are missing information that you cannot answer from context.',
  'Use markdown formatting for readability.',
].join(' ')
