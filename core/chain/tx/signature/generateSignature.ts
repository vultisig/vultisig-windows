import { SignatureFormat } from '@core/chain/signing/SignatureFormat'
import { KeysignSignature } from '@core/mpc/keysign/KeysignSignature'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { match } from '@lib/utils/match'
import { pick } from '@lib/utils/record/pick'
import { recordMap } from '@lib/utils/record/recordMap'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  walletCore: WalletCore
  signature: KeysignSignature
  signatureFormat: SignatureFormat
}

export const generateSignature = ({
  walletCore,
  signature,
  signatureFormat,
}: Input) => {
  return match(signatureFormat, {
    rawWithRecoveryId: () => {
      const [r, s, recovery_id] = withoutUndefined([
        signature.r,
        signature.s,
        signature.recovery_id,
      ]).map(value => walletCore.HexCoding.decode(value))

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
