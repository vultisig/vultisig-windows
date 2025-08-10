import type { SolanaSignInInput } from '@solana/wallet-standard-features'

type BuiltSignIn = { message: string; bytes: Uint8Array }

const enc = new TextEncoder()

const isIso = (s?: string) => !s || !Number.isNaN(Date.parse(s))
const trimOrUndef = (s?: string) => (s?.trim() ? s.trim() : undefined)

export const createSolanaSignInMessage = (
  input: SolanaSignInInput
): BuiltSignIn => {
  const domain =
    trimOrUndef(input.domain) ??
    (typeof window !== 'undefined' ? window.location.host : 'localhost')
  const address = trimOrUndef(input.address)
  if (!address) throw new Error('address is required')

  const statement = trimOrUndef(input.statement)
  const uri =
    trimOrUndef(input.uri) ??
    (typeof window !== 'undefined' ? window.location.href : undefined)
  const version = trimOrUndef(input.version) ?? '1'
  const chainId = trimOrUndef(input.chainId)
  const nonce =
    trimOrUndef(input.nonce) ??
    crypto.randomUUID?.() ??
    `${Math.random()}`.slice(2)
  const issuedAt = trimOrUndef(input.issuedAt) ?? new Date().toISOString()
  const expirationTime = trimOrUndef(input.expirationTime)
  const notBefore = trimOrUndef(input.notBefore ?? (input as any).invalidBefore)
  const requestId = trimOrUndef(input.requestId)
  const resources = input.resources?.filter(Boolean).map(r => r.trim())

  if (!isIso(issuedAt) || !isIso(expirationTime) || !isIso(notBefore)) {
    throw new Error(
      'issuedAt/expirationTime/notBefore must be ISO-8601 strings'
    )
  }

  let message = `${domain} wants you to sign in with your Solana account:\n${address}`

  if (statement) message += `\n\n${statement}`
  if (uri) message += `\n\nURI: ${uri}`
  if (version) message += `\nVersion: ${version}`
  if (chainId) message += `\nChain ID: ${chainId}`
  if (nonce) message += `\nNonce: ${nonce}`
  if (issuedAt) message += `\nIssued At: ${issuedAt}`
  if (expirationTime) message += `\nExpiration Time: ${expirationTime}`
  if (notBefore) message += `\nNot Before: ${notBefore}`
  if (requestId) message += `\nRequest ID: ${requestId}`
  if (resources && resources.length) {
    message += `\nResources:`
    for (const r of resources) message += `\n- ${r}`
  }

  return { message, bytes: enc.encode(message) }
}
