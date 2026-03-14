import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type ZcashSaplingContext = {
  notes: { note_data: string; witness_data: string }[]
  outputs: { address: string; amount: number }[]
  fee: number
  alphas: string[]
  sighash: string
}

type Input = {
  public_key: string
  messages: string[]
  session: string
  hex_encryption_key: string
  derive_path: string
  is_ecdsa: boolean
  vault_password: string
  chain: string
  zcash_sapling?: ZcashSaplingContext
}

export const signWithServer = async (input: Input) => {
  const url = `${fastVaultServerUrl}/sign`
  console.log('[signWithServer]', url, {
    chain: input.chain,
    is_ecdsa: input.is_ecdsa,
    derive_path: input.derive_path,
    session: input.session,
    messagesCount: input.messages.length,
    messagesLengths: input.messages.map(m => m.length),
    hasZcashSapling: !!input.zcash_sapling,
    zcashAlphasCount: input.zcash_sapling?.alphas?.length,
  })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const result = await queryUrl(url, {
      body: input,
      responseType: 'none',
      signal: controller.signal,
    })
    console.log('[signWithServer] success')
    return result
  } catch (err) {
    console.error('[signWithServer] failed:', err)
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
