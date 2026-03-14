import { Chain } from '@core/chain/Chain'
import { getLatestBlock } from '@core/chain/chains/zcash/lightwalletd/client'
import { getSaplingProver } from '@core/chain/chains/zcash/saplingProver'
import {
  getZcashSaplingSpendableNotes,
  planZcashSaplingSpend,
} from '@core/chain/chains/zcash/saplingSpending'
import { ensureZcashScanDataSynced } from '@core/chain/chains/zcash/scanner'
import { getZcashScanStorage } from '@core/chain/chains/zcash/zcashScanStorage'
import { initializeFrozt } from '@core/mpc/frozt/initialize'
import { Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import {
  frozt_keyshare_bundle_birthday,
  frozt_sapling_derive_keys,
  WasmTxBuilder,
} from 'frozt-wasm'

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
  console.log('[prepareZcashSaplingTx] start', {
    zAddress,
    toAddress,
    amount,
  })
  await initializeFrozt()
  console.log('[prepareZcashSaplingTx] frozt initialized')
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
  console.log('[prepareZcashSaplingTx] deriving sapling keys')
  const saplingKeys = frozt_sapling_derive_keys(pubKeyPackage, saplingExtras)
  console.log(
    '[prepareZcashSaplingTx] sapling keys derived, address:',
    saplingKeys.address
  )

  const bundleBase64 = shouldBePresent(
    vault.chainKeyShares?.[Chain.ZcashSapling],
    'Frozt keyshare bundle'
  )
  const birthday = Number(
    frozt_keyshare_bundle_birthday(Buffer.from(bundleBase64, 'base64'))
  )

  console.log('[prepareZcashSaplingTx] running catch-up scan')
  await ensureZcashScanDataSynced({
    zAddress,
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    pubKeyPackage,
    saplingExtras,
    birthHeight: birthday > 0 ? birthday : null,
  })

  const scanData = await getZcashScanStorage().load(vault.publicKeys.ecdsa)
  const chainHeight = scanData?.scanHeight ?? null
  const spendableNotes = getZcashSaplingSpendableNotes(
    scanData?.notes ?? [],
    chainHeight
  )
  console.log('[prepareZcashSaplingTx] spendable notes:', spendableNotes.length)

  const spendPlan = planZcashSaplingSpend({
    notes: scanData?.notes ?? [],
    chainHeight,
    amount,
  })
  const { selectedNotes, fee, changeAmount } = spendPlan
  console.log('[prepareZcashSaplingTx] selected notes/fee:', {
    selectedNotes: selectedNotes.length,
    fee,
    changeAmount,
    chainHeight,
  })

  console.log('[prepareZcashSaplingTx] awaiting sapling prover')
  const [prover, latestBlock] = await Promise.all([
    proverPromise,
    getLatestBlock(),
  ])
  console.log(
    '[prepareZcashSaplingTx] creating builder at height',
    latestBlock.height
  )
  const builder = prover.createBuilder(
    pubKeyPackage,
    saplingExtras,
    latestBlock.height
  )

  const alphas: string[] = []
  const notes: ZcashSaplingNote[] = []
  const noteNullifiers: string[] = []
  const proofStartAt = Date.now()
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
    '[prepareZcashSaplingTx] spend/output proofs generated in',
    `${Date.now() - proofStartAt}ms`
  )
  console.log(
    '[prepareZcashSaplingTx] building tx with',
    alphas.length,
    'spends'
  )
  const buildStartAt = Date.now()
  builder.build()
  console.log(
    '[prepareZcashSaplingTx] tx built in',
    `${Date.now() - buildStartAt}ms, getting sighash`
  )

  const sighashHex = Buffer.from(builder.sighash).toString('hex')
  console.log(
    '[prepareZcashSaplingTx] sighash:',
    sighashHex.slice(0, 16) + '...'
  )

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
