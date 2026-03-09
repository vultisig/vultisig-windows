import { Chain } from '@core/chain/Chain'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { getSaplingProver } from '@core/chain/chains/zcash/saplingProver'
import { getZcashScanStorage } from '@core/chain/chains/zcash/zcashScanStorage'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { frozt_sapling_derive_keys, WasmTxBuilder } from 'frozt-wasm'

type Input = {
  vault: Vault
  zAddress: string
  toAddress: string
  amount: number
  fee: number
}

export type ZcashShieldedNote = {
  note_data: string
  witness_data: string
}

export type ZcashShieldedOutput = {
  address: string
  amount: number
}

export type ZcashShieldedContext = {
  notes: ZcashShieldedNote[]
  outputs: ZcashShieldedOutput[]
  fee: number
  alphas: string[]
  sighash: string
}

export type ZcashShieldedSignData = {
  messages: string[]
  context: ZcashShieldedContext
}

export type ZcashPreparedTx = {
  builder: WasmTxBuilder
  signData: ZcashShieldedSignData
  noteNullifiers: string[]
  zAddress: string
}

export const prepareZcashShieldedTx = async ({
  vault,
  zAddress,
  toAddress,
  amount,
  fee,
}: Input): Promise<ZcashPreparedTx> => {
  console.log('[prepareZcashShieldedTx] start', {
    zAddress,
    toAddress,
    amount,
    fee,
  })
  await initializeFrozt()
  console.log('[prepareZcashShieldedTx] frozt initialized')

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
  console.log('[prepareZcashShieldedTx] deriving sapling keys')
  const saplingKeys = frozt_sapling_derive_keys(pubKeyPackage, saplingExtras)
  console.log(
    '[prepareZcashShieldedTx] sapling keys derived, address:',
    saplingKeys.address
  )

  const scanData = await getZcashScanStorage().load(zAddress)
  const unspentNotes = (scanData?.notes ?? []).filter(n => !n.spent)
  console.log('[prepareZcashShieldedTx] unspent notes:', unspentNotes.length)
  const spendable = unspentNotes
    .filter(n => n.noteData && n.witnessData)
    .sort((a, b) => b.value - a.value)

  const required = amount + fee
  const selectedNotes: typeof spendable = []
  let selectedTotal = 0
  for (const n of spendable) {
    if (selectedTotal >= required) break
    selectedNotes.push(n)
    selectedTotal += n.value
  }
  if (selectedTotal < required) {
    throw new Error(
      `Insufficient shielded balance: have ${selectedTotal}, need ${required} zatoshis`
    )
  }

  const changeAmount = selectedTotal - amount - fee

  console.log('[prepareZcashShieldedTx] loading sapling prover')
  const [prover, latestBlock] = await Promise.all([
    getSaplingProver(),
    getLatestBlock(),
  ])
  console.log(
    '[prepareZcashShieldedTx] creating builder at height',
    latestBlock.height
  )
  const builder = prover.createBuilder(
    pubKeyPackage,
    saplingExtras,
    latestBlock.height
  )

  const alphas: string[] = []
  const notes: ZcashShieldedNote[] = []
  const noteNullifiers: string[] = []
  for (const note of selectedNotes) {
    const noteData = new Uint8Array(Buffer.from(note.noteData!, 'hex'))
    const witnessData = new Uint8Array(Buffer.from(note.witnessData!, 'hex'))
    const alpha = builder.addSpend(noteData, witnessData)
    alphas.push(Buffer.from(alpha).toString('hex'))
    notes.push({
      note_data: note.noteData!,
      witness_data: note.witnessData!,
    })
    noteNullifiers.push(note.nullifier)
  }

  builder.addOutput(toAddress, amount)
  if (changeAmount > 0) {
    builder.addOutput(saplingKeys.address, changeAmount)
  }
  console.log(
    '[prepareZcashShieldedTx] building tx with',
    alphas.length,
    'spends'
  )
  builder.build()
  console.log('[prepareZcashShieldedTx] tx built, getting sighash')

  const sighashHex = Buffer.from(builder.sighash).toString('hex')
  console.log(
    '[prepareZcashShieldedTx] sighash:',
    sighashHex.slice(0, 16) + '...'
  )

  const outputs: ZcashShieldedOutput[] = [{ address: toAddress, amount }]
  if (changeAmount > 0) {
    outputs.push({ address: saplingKeys.address, amount: changeAmount })
  }

  const signData: ZcashShieldedSignData = {
    messages: [sighashHex],
    context: {
      notes,
      outputs,
      fee,
      alphas,
      sighash: sighashHex,
    },
  }

  return { builder, signData, noteNullifiers, zAddress }
}
