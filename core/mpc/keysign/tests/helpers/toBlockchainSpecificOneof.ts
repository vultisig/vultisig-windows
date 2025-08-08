import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

export function toBlockchainSpecificOneof(
  bsRaw: any
): KeysignPayload['blockchainSpecific'] | undefined {
  if (!bsRaw) return undefined
  if (bsRaw.case) return bsRaw

  // bsRaw is something like { ethereumSpecific: {...} }
  const entries = Object.entries(bsRaw).filter(([, v]) => v != null)
  if (entries.length !== 1) {
    // keep this strict so we surface odd inputs
    throw new Error('Unexpected blockchainSpecific shape in fixture')
  }
  const [k, v] = entries[0]
  return { case: k as any, value: v } as KeysignPayload['blockchainSpecific']
}
