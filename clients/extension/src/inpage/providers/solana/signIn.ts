import type { SolanaSignInInput } from '@solana/wallet-standard-features'

export function createSolanaSignInMessage({
  domain,
  address,
  statement,
  uri,
  version,
  chainId,
  nonce,
  issuedAt,
  expirationTime,
  notBefore,
  requestId,
  resources,
}: SolanaSignInInput): string {
  let message = `${domain} wants you to sign in with your Solana account:\n${address}`

  if (statement) {
    message += `\n\n${statement}`
  }

  if (uri) message += `\n\nURI: ${uri}`
  if (version) message += `\nVersion: ${version}`
  if (chainId) message += `\nChain ID: ${chainId}`
  if (nonce) message += `\nNonce: ${nonce}`
  if (issuedAt) message += `\nIssued At: ${issuedAt}`
  if (expirationTime) message += `\nExpiration Time: ${expirationTime}`
  if (notBefore) message += `\nNot Before: ${notBefore}`
  if (requestId) message += `\nRequest ID: ${requestId}`

  if (resources && resources.length > 0) {
    message += `\nResources:`
    for (const resource of resources) {
      message += `\n- ${resource}`
    }
  }

  return message
}
