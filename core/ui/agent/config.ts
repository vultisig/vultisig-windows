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

type AgentInstructionsInput = {
  allVaultsJson?: string
  addressBookJson?: string
}

const baseAgentInstructions = [
  'You are currently running inside the Vultisig Windows app.',
  'When a user asks for an address from another vault by name, look at the injected `context.all_vaults` JSON array in this prompt. Find the vault using fuzzy or partial name matching on the `name` field, and output the exact address found in its `addresses` object. Never say you do not have access to other vaults when they are present in `all_vaults`.',
  'When a user asks to send funds to a name or contact, check both the injected `context.all_vaults` and `context.address_book` JSON arrays using fuzzy or partial name matching. Internal vault addresses may also be mirrored into `context.address_book` using the vault name as the title. If you find a single clear match, use that address. If there are multiple plausible matches or you are unsure whether they mean a contact or an internal vault, ask the user to clarify before proceeding.',
  'Prefer using your knowledge and the provided JSON conversation context over calling tools. Only call a tool when you are missing information that you cannot answer from context.',
  'Use markdown formatting for readability.',
].join(' ')

export const getAgentInstructions = ({
  allVaultsJson,
  addressBookJson,
}: AgentInstructionsInput = {}) => {
  const fallbackSlices = [
    allVaultsJson
      ? `Authoritative fallback for context.all_vaults if that field is missing in structured context: ${allVaultsJson}`
      : undefined,
    addressBookJson
      ? `Authoritative fallback for context.address_book if that field is missing in structured context: ${addressBookJson}`
      : undefined,
  ].filter(Boolean)

  return [baseAgentInstructions, ...fallbackSlices].join(' ')
}
