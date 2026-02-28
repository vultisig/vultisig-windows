import { Chain } from '@core/chain/Chain'
import { getCustomMessageHex } from '@core/ui/mpc/keysign/customMessage/getCustomMessageHex'
import { z } from 'zod'

import {
  fastVaultKeysign,
  formatKeysignSignatureHex,
} from '../shared/fastVaultKeysign'
import type { ToolHandler } from '../types'

const eip712PayloadSchema = z.object({
  id: z.string(),
  primaryType: z.string().optional(),
  domain: z.record(z.string(), z.unknown()),
  types: z.record(z.string(), z.array(z.unknown())),
  message: z.record(z.string(), z.unknown()),
  chain: z.string().optional(),
})

const signTypedDataInputSchema = z.object({
  payloads: z.array(eip712PayloadSchema),
})

const evmDerivePath = "m/44'/60'/0'/0/0"

const resolveChain = (chain?: string): Chain =>
  chain && chain in Chain ? (chain as Chain) : Chain.Polygon

export const handleSignTypedData: ToolHandler = async (input, context) => {
  const vault = context.vault
  if (!vault) {
    throw new Error('Vault metadata required for signing')
  }

  const { payloads } = signTypedDataInputSchema.parse(input)
  const signatures: { id: string; signature: string }[] = []

  for (const payload of payloads) {
    const chain = resolveChain(payload.chain)

    const typedData = JSON.stringify({
      primaryType: payload.primaryType,
      domain: payload.domain,
      types: payload.types,
      message: payload.message,
    })

    const messageHash = getCustomMessageHex({
      chain,
      message: typedData,
      method: 'eth_signTypedData_v4',
    })

    const keysignResult = await fastVaultKeysign({
      vault,
      messageHash,
      derivePath: evmDerivePath,
      signatureAlgorithm: 'ecdsa',
      chain: chain,
    })

    signatures.push({
      id: payload.id,
      signature: formatKeysignSignatureHex(keysignResult),
    })
  }

  return { data: { signatures } }
}
