const fastVaultBaseUrl = 'https://api.vultisig.com'

type FastVaultSignParams = {
  publicKey: string
  messages: string[]
  session: string
  hexEncryptionKey: string
  derivePath: string
  isEcdsa: boolean
  vaultPassword: string
  chain: string
}

export async function callFastVaultSign(
  params: FastVaultSignParams
): Promise<void> {
  const body = {
    public_key: params.publicKey,
    messages: params.messages,
    session: params.session,
    hex_encryption_key: params.hexEncryptionKey,
    derive_path: params.derivePath,
    is_ecdsa: params.isEcdsa,
    vault_password: params.vaultPassword,
    chain: params.chain,
  }

  const resp = await fetch(`${fastVaultBaseUrl}/vault/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(
      `Fast vault sign failed (${resp.status}): ${text.trim() || 'unknown error'}`
    )
  }
}

type FastVaultReshareParams = {
  name: string
  publicKey: string
  sessionId: string
  hexEncryptionKey: string
  hexChainCode: string
  localPartyId: string
  oldParties: string[]
  oldResharePrefix: string
  encryptionPassword: string
  libType: number
}

export async function requestFastVaultReshare(
  params: FastVaultReshareParams
): Promise<void> {
  const body = {
    name: params.name,
    public_key: params.publicKey,
    session_id: params.sessionId,
    hex_encryption_key: params.hexEncryptionKey,
    hex_chain_code: params.hexChainCode,
    local_party_id: params.localPartyId,
    old_parties: params.oldParties,
    old_reshare_prefix: params.oldResharePrefix,
    encryption_password: params.encryptionPassword,
    email: '',
    reshare_type: 1,
    lib_type: params.libType,
  }

  const resp = await fetch(`${fastVaultBaseUrl}/vault/reshare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(
      `Fast vault reshare failed (${resp.status}): ${text.trim() || 'unknown error'}`
    )
  }
}
