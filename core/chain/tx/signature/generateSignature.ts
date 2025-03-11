import { SignatureFormat } from '@core/chain/signing/SignatureFormat'
import { match } from '@lib/utils/match'
import { pick } from '@lib/utils/record/pick'
import { recordMap } from '@lib/utils/record/recordMap'
import { WalletCore } from '@trustwallet/wallet-core'

export interface KeysignResponse {
  msg: string
  r: string
  s: string
  der_signature: string
  recovery_id: string
}

type Input = {
  walletCore: WalletCore
  signature: KeysignResponse
  signatureFormat: SignatureFormat
}

export const generateSignature = ({
  walletCore,
  signature,
  signatureFormat,
}: Input) => {
  return match(signatureFormat, {
    rawWithRecoveryId: () => {
      const { r, s, recovery_id } = recordMap(
        pick(signature, ['r', 's', 'recovery_id']),
        value => walletCore.HexCoding.decode(value)
      )

      return new Uint8Array([...r, ...s, ...recovery_id])
    },
    raw: () => {
      const { r, s } = recordMap(pick(signature, ['r', 's']), value =>
        walletCore.HexCoding.decode(value).reverse()
      )

      return new Uint8Array([...r, ...s])
    },
    der: () => {
      return walletCore.HexCoding.decode(signature.der_signature)
    },
  })
}
