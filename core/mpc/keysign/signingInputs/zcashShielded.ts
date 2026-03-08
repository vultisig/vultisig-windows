import { Chain } from '@core/chain/Chain'
import { getUnspentNotes } from '@core/chain/chains/zcash/SaplingNote'
import { getSaplingProver } from '@core/chain/chains/zcash/saplingProver'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { frozt_sapling_derive_keys } from 'frozt-wasm'

type Input = {
  vault: Vault
  zAddress: string
  toAddress: string
  amount: number
  fee: number
}

export const getZcashShieldedSignMessages = async ({
  vault,
  zAddress,
  toAddress,
  amount,
  fee,
}: Input): Promise<string[]> => {
  await initializeFrozt()

  const pubKeyPackageBase64 = shouldBePresent(
    vault.chainPublicKeys?.[Chain.ZcashShielded],
    'Frozt public key package'
  )
  const saplingExtrasBase64 = shouldBePresent(
    vault.saplingExtras,
    'Sapling extras'
  )

  const pubKeyPackage = Buffer.from(pubKeyPackageBase64, 'base64')
  const saplingExtras = Buffer.from(saplingExtrasBase64, 'base64')
  const saplingKeys = frozt_sapling_derive_keys(pubKeyPackage, saplingExtras)

  const unspentNotes = getUnspentNotes(zAddress)
  const note = unspentNotes.find(n => n.value >= amount)
  if (!note) {
    throw new Error(
      `No unspent shielded note with sufficient balance (need ${amount} zatoshis)`
    )
  }
  if (!note.noteData || !note.witnessData) {
    throw new Error(
      'Note is missing noteData or witnessData. Block scanning is required.'
    )
  }

  const noteData = new Uint8Array(Buffer.from(note.noteData, 'hex'))
  const witnessData = new Uint8Array(Buffer.from(note.witnessData, 'hex'))
  const changeAmount = note.value - amount - fee

  const prover = await getSaplingProver()
  const builder = prover.createBuilder(pubKeyPackage, saplingExtras, 0)
  builder.addSpend(noteData, witnessData)
  builder.addOutput(toAddress, amount)
  if (changeAmount > 0) {
    builder.addOutput(saplingKeys.address, changeAmount)
  }
  builder.build()

  const sighashHex = Buffer.from(builder.sighash).toString('hex')
  return [sighashHex]
}
