// @vitest-environment happy-dom
import { BinaryReader } from '@bufbuild/protobuf/wire'
import { ChildrenProp } from '@lib/ui/props'
import { render } from '@testing-library/react'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { describe, expect, it, vi } from 'vitest'

import { generateClaimProofForClaim } from '../utils/generateClaimProofForClaim'
import { ClaimPreparingTxPhase } from './ClaimPreparingTxPhase'

const { prepare } = vi.hoisted(() => ({ prepare: vi.fn() }))

vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn }: { mutationFn: () => Promise<unknown> }) => {
    prepare.mockImplementation(mutationFn)
    return { mutate: vi.fn(), isError: false }
  },
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVaultSecurityType: () => 'fast',
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@core/ui/flow/FullPageFlowErrorState', () => ({
  FullPageFlowErrorState: () => null,
}))
vi.mock('@lib/ui/page/PageHeader', () => ({ PageHeader: () => null }))
vi.mock('@lib/ui/loaders/Spinner', () => ({ Spinner: () => null }))
vi.mock('@lib/ui/layout/Stack', () => ({
  VStack: ({ children }: ChildrenProp) => <>{children}</>,
}))
vi.mock('@lib/ui/text', () => ({
  Text: ({ children }: ChildrenProp) => <>{children}</>,
}))
vi.mock('../utils/encodeClaimSignature', () => ({
  encodeClaimSignature: () => 'compact-signature',
}))
vi.mock('../utils/getQbtcAccountInfoForClaim', () => ({
  getQbtcAccountExists: async () => true,
  getQbtcAccountInfoForClaim: async () => ({
    accountNumber: 9591234282079533897n,
    sequence: 3n,
  }),
}))
vi.mock('../utils/generateClaimProofForClaim', () => ({
  generateClaimProofForClaim: vi.fn(async () => ({
    kind: 'wallet',
    proof: { proof: 'ab'.repeat(120), pub_key_hash_sha256: 'ee'.repeat(32) },
  })),
}))

describe('QBTC claim transaction address binding (qbtc#225)', () => {
  it.each([
    'bc1qatknmeca5p0fy5decdj5704hf7prt47e0e7e9n',
    '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
  ])(
    'encodes the same vault-derived address %s that was sent for proof generation',
    async bitcoinAddress => {
      vi.clearAllMocks()
      render(
        <ClaimPreparingTxPhase
          bitcoinAddress={bitcoinAddress}
          qbtcAddress="qbtc1a7hnjntwm7cgjptyw6arru0a8waedyaaluzr34"
          utxos={[{ txid: 'aa'.repeat(32), vout: 0, amount: 100000000 }]}
          btcSig={{
            msg: '',
            r: '1',
            s: '2',
            recovery_id: '0',
            der_signature: '',
          }}
          mldsaPublicKeyHex={'77'.repeat(1952)}
          onReadyToSign={vi.fn()}
          onServerBroadcast={vi.fn()}
          onError={vi.fn()}
        />
      )
      const result = await prepare()
      expect(result.kind).toBe('wallet')
      expect(generateClaimProofForClaim).toHaveBeenCalledWith(
        expect.objectContaining({ bitcoinAddress, broadcast: false })
      )
      const body = TxBody.decode(result.ready.bodyBytes)
      const reader = new BinaryReader(body.messages[0].value)
      const fields = new Map<number, Uint8Array>()
      while (reader.pos < reader.len) {
        const [field] = reader.tag()
        fields.set(field, reader.bytes())
      }
      expect(Buffer.from(fields.get(8) ?? []).toString()).toBe(bitcoinAddress)
    }
  )
})
