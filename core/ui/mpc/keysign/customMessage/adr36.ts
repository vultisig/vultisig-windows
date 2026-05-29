import { makeSignDoc, serializeSignDoc, StdSignDoc } from '@cosmjs/amino'

type Adr36SignDocInput = {
  /** bech32 address of the signing account */
  signer: string
  /** base64-encoded arbitrary payload */
  dataBase64: string
}

/**
 * Builds the ADR-36 amino `StdSignDoc` that Keplr's `signArbitrary` signs.
 *
 * The data is wrapped in a `sign/MsgSignData` message inside the fixed
 * envelope ADR-36 mandates — empty `chain_id`, zero account/sequence, empty
 * fee and memo — so any verifier can reconstruct the exact same doc from just
 * `(signer, data)`. This envelope can never be a valid transaction sign-doc,
 * which is what keeps arbitrary signing from being abused as blind tx signing.
 */
const buildAdr36SignDoc = ({
  signer,
  dataBase64,
}: Adr36SignDocInput): StdSignDoc =>
  makeSignDoc(
    [{ type: 'sign/MsgSignData', value: { signer, data: dataBase64 } }],
    { gas: '0', amount: [] },
    '',
    '',
    '0',
    '0'
  )

/**
 * Canonical ADR-36 sign bytes (sorted-JSON UTF-8). These are the bytes that
 * get hashed (sha256) and signed; verifiers hash the same serialization.
 */
export const serializeAdr36SignDoc = ({
  signer,
  dataBase64,
}: Adr36SignDocInput): Uint8Array =>
  serializeSignDoc(buildAdr36SignDoc({ signer, dataBase64 }))
