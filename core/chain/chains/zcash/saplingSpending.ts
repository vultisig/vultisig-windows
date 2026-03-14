import { SaplingNote } from './SaplingNote'

export const zcashSaplingMinConfirmations = 3

const zcashSaplingZip317GraceActions = 2
const zcashSaplingZip317MarginalFee = 5000
const zcashSaplingZip317MinFee = 10000

export const isZcashSaplingNoteSpendable = (
  note: SaplingNote,
  chainHeight: number | null
): boolean => {
  if (note.spent) {
    return false
  }

  // Legacy cached notes may not have a stored block height yet.
  if (note.height == null || chainHeight == null) {
    return true
  }

  return chainHeight - note.height >= zcashSaplingMinConfirmations
}

export const getZcashSaplingSafeScanHeight = (chainHeight: number): number =>
  Math.max(chainHeight - zcashSaplingMinConfirmations, 0)

export const getZcashSaplingSpendableNotes = (
  notes: SaplingNote[],
  chainHeight: number | null
): SaplingNote[] =>
  notes.filter(note => isZcashSaplingNoteSpendable(note, chainHeight))

export const getZcashSaplingSpendableBalance = (
  notes: SaplingNote[],
  chainHeight: number | null
): bigint => {
  let total = BigInt(0)
  for (const note of getZcashSaplingSpendableNotes(notes, chainHeight)) {
    total += BigInt(note.value)
  }
  return total
}

export const getConfirmingZcashNotes = (
  notes: SaplingNote[],
  chainHeight: number | null
): SaplingNote[] =>
  notes.filter(n => {
    if (n.spent) return false
    if (n.height == null || chainHeight == null) return false
    return chainHeight - n.height < zcashSaplingMinConfirmations
  })

export const getZcashConfirmationsRemaining = (
  confirmingNotes: SaplingNote[],
  chainHeight: number | null
): number => {
  if (confirmingNotes.length === 0) return 0
  if (chainHeight == null) return zcashSaplingMinConfirmations
  let maxRemaining = 0
  for (const n of confirmingNotes) {
    if (n.height == null) continue
    const confs = Math.max(0, chainHeight - n.height)
    const remaining = Math.max(0, zcashSaplingMinConfirmations - confs)
    maxRemaining = Math.max(maxRemaining, remaining)
  }
  return maxRemaining
}

export const getZcashSaplingZip317Fee = ({
  saplingSpends,
  saplingOutputs,
}: {
  saplingSpends: number
  saplingOutputs: number
}): number => {
  const logicalActions = Math.max(saplingSpends, saplingOutputs)
  return Math.max(
    zcashSaplingZip317MinFee,
    zcashSaplingZip317MarginalFee *
      Math.max(zcashSaplingZip317GraceActions, logicalActions)
  )
}

export type ZcashSaplingSpendPlan = {
  selectedNotes: SaplingNote[]
  selectedTotal: number
  fee: number
  changeAmount: number
  outputCount: number
}

export const planZcashSaplingSpend = ({
  notes,
  chainHeight,
  amount,
}: {
  notes: SaplingNote[]
  chainHeight: number | null
  amount: number
}): ZcashSaplingSpendPlan => {
  const spendableNotes = getZcashSaplingSpendableNotes(notes, chainHeight)
    .filter(note => note.noteData && note.witnessData)
    .sort((a, b) => b.value - a.value)

  let fee = getZcashSaplingZip317Fee({
    saplingSpends: 0,
    saplingOutputs: 1,
  })
  let lastPlan: ZcashSaplingSpendPlan | null = null

  for (let i = 0; i <= spendableNotes.length + 1; i++) {
    const required = amount + fee
    const selectedNotes: SaplingNote[] = []
    let selectedTotal = 0

    for (const note of spendableNotes) {
      if (selectedTotal >= required) {
        break
      }

      selectedNotes.push(note)
      selectedTotal += note.value
    }

    if (selectedTotal < required) {
      throw new Error(
        `Insufficient spendable shielded balance: have ${selectedTotal}, need ${required} zatoshis`
      )
    }

    const changeAmount = selectedTotal - amount - fee
    const outputCount = 1 + (changeAmount > 0 ? 1 : 0)
    const nextFee = getZcashSaplingZip317Fee({
      saplingSpends: selectedNotes.length,
      saplingOutputs: outputCount,
    })

    lastPlan = {
      selectedNotes,
      selectedTotal,
      fee,
      changeAmount,
      outputCount,
    }

    if (nextFee === fee) {
      return lastPlan
    }

    fee = nextFee
  }

  if (lastPlan) {
    return lastPlan
  }

  throw new Error('Failed to plan Zcash Sapling spend')
}
