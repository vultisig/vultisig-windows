export type SaplingNote = {
  txid: string
  outputIndex: number
  value: number
  rcm: string
  cmu: string
  nullifier: string
  witnessPosition: number
  witnessPath: string
  spent: boolean
  createdAt: number
  noteData?: string
  witnessData?: string
}

const getStorageKey = (zAddress: string): string => `sapling-notes:${zAddress}`

export const loadSaplingNotes = (zAddress: string): SaplingNote[] => {
  const key = getStorageKey(zAddress)
  const raw = localStorage.getItem(key)
  if (!raw) {
    return []
  }
  return JSON.parse(raw) as SaplingNote[]
}

export const saveSaplingNotes = (
  zAddress: string,
  notes: SaplingNote[]
): void => {
  const key = getStorageKey(zAddress)
  localStorage.setItem(key, JSON.stringify(notes))
}

export const addSaplingNote = (zAddress: string, note: SaplingNote): void => {
  const notes = loadSaplingNotes(zAddress)
  notes.push(note)
  saveSaplingNotes(zAddress, notes)
}

export const markNoteSpent = (zAddress: string, nullifier: string): void => {
  const notes = loadSaplingNotes(zAddress)
  const updated = notes.map(note => {
    if (note.nullifier === nullifier) {
      return { ...note, spent: true }
    }
    return note
  })
  saveSaplingNotes(zAddress, updated)
}

export const getUnspentNotes = (zAddress: string): SaplingNote[] => {
  const notes = loadSaplingNotes(zAddress)
  return notes.filter(note => !note.spent)
}
