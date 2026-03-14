import { Chain } from '@core/chain/Chain'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { getSaplingProver } from '@core/chain/chains/zcash/saplingProver'
import { planZcashSaplingSpend } from '@core/chain/chains/zcash/saplingSpending'
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
}

type ZcashSaplingNote = {
  note_data: string
  witness_data: string
}

type ZcashSaplingOutput = {
  address: string
  amount: number
}

type ZcashSaplingContext = {
  notes: ZcashSaplingNote[]
  outputs: ZcashSaplingOutput[]
  fee: number
  alphas: string[]
  sighash: string
}

export type ZcashSaplingSignData = {
  messages: string[]
  context: ZcashSaplingContext
}

export type ZcashPreparedTx = {
  builder: WasmTxBuilder
  signData: ZcashSaplingSignData
  noteNullifiers: string[]
  zAddress: string
  publicKeyEcdsa: string
}

export const prepareZcashSaplingTx = async ({
  vault,
  zAddress,
  toAddress,
  amount,
}: Input): Promise<ZcashPreparedTx> => {
  await initializeFrozt()
  const proverPromise = getSaplingProver()

  const pubKeyPackageBase64 = shouldBePresent(
    vault.chainPublicKeys?.[Chain.ZcashSapling],
    'Frozt public key package'
  )
  const saplingExtrasBase64 = shouldBePresent(
    vault.saplingExtras,
    'Sapling extras'
  )

  const pubKeyPackage = Buffer.from(pubKeyPackageBase64, 'base64')
  const saplingExtras = Buffer.from(saplingExtrasBase64, 'base64')
  const saplingKeys = frozt_sapling_derive_keys(pubKeyPackage, saplingExtras)

  const scanData = await getZcashScanStorage().load(vault.publicKeys.ecdsa)
  if (
    !scanData ||
    !scanData.birthdayScanDone ||
    scanData.scanHeight == null ||
    scanData.zAddress !== zAddress
  ) {
    throw new Error(
      'Zcash shielded scan data is missing or incomplete. Open Sync and let it finish before sending.'
    )
  }

  const chainHeight = scanData?.scanHeight ?? null
  const spendPlan = planZcashSaplingSpend({
    notes: scanData?.notes ?? [],
    chainHeight,
    amount,
  })
  const { selectedNotes, fee, changeAmount } = spendPlan
  const [prover, latestBlock] = await Promise.all([
    proverPromise,
    getLatestBlock(),
  ])
  const builder = prover.createBuilder(
    pubKeyPackage,
    saplingExtras,
    latestBlock.height
  )

  const alphas: string[] = []
  const notes: ZcashSaplingNote[] = []
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
  builder.build()

  const sighashHex = Buffer.from(builder.sighash).toString('hex')

  const outputs: ZcashSaplingOutput[] = [{ address: toAddress, amount }]
  if (changeAmount > 0) {
    outputs.push({ address: saplingKeys.address, amount: changeAmount })
  }

  const signData: ZcashSaplingSignData = {
    messages: [sighashHex],
    context: {
      notes,
      outputs,
      fee,
      alphas,
      sighash: sighashHex,
    },
  }

  return {
    builder,
    signData,
    noteNullifiers,
    zAddress,
    publicKeyEcdsa: vault.publicKeys.ecdsa,
  }
}
