import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import {
  Keyshare as DklsKeyshare,
  SignSession as DklsSignSession,
} from '@lib/dkls/vs_wasm'
import {
  Keyshare as MldsaKeyshare,
  SignSession as MldsaSignSession,
} from '@lib/mldsa/vs_wasm'
import {
  Keyshare as SchnorrKeyshare,
  SignSession as SchnorrSignSession,
} from '@lib/schnorr/vs_schnorr_wasm'
import { match } from '@lib/utils/match'

const mldsaLevel = 44

/** Wraps MldsaSignSession statics to match the 4-param setup signature of DKLS/Schnorr. */
const MldsaSignSessionWithLevel = {
  setup: (
    keyId: Uint8Array,
    chainPath: string,
    messageHash: Uint8Array | null | undefined,
    ids: string[]
  ) => MldsaSignSession.setup(mldsaLevel, keyId, chainPath, messageHash, ids),
  setupMessageHash: (setupMsg: Uint8Array) =>
    MldsaSignSession.setupMessageHash(setupMsg),
}

export const SignSession = {
  ecdsa: DklsSignSession,
  eddsa: SchnorrSignSession,
  mldsa: MldsaSignSessionWithLevel,
} satisfies Record<SignatureAlgorithm, unknown>

type MakeSignSessionInput = {
  setupMessage: Uint8Array
  localPartyId: string
  keyShare: string
  signatureAlgorithm: SignatureAlgorithm
}

/** Routing boundary: dispatches to the correct WASM SignSession per algorithm. */
export const makeSignSession = ({
  setupMessage,
  localPartyId,
  keyShare,
  signatureAlgorithm,
}: MakeSignSessionInput) => {
  const keyShareBytes = Buffer.from(keyShare, 'base64')
  return match(signatureAlgorithm, {
    ecdsa: () =>
      new DklsSignSession(
        setupMessage,
        localPartyId,
        DklsKeyshare.fromBytes(keyShareBytes)
      ),
    eddsa: () =>
      new SchnorrSignSession(
        setupMessage,
        localPartyId,
        SchnorrKeyshare.fromBytes(keyShareBytes)
      ),
    mldsa: () =>
      new MldsaSignSession(
        setupMessage,
        localPartyId,
        MldsaKeyshare.fromBytes(keyShareBytes)
      ),
  })
}
