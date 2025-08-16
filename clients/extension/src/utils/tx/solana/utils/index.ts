import {
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'

import { AddressTableLookup, PartialInstruction } from '../types/types'

type IdlAccountItem =
  | {
      name: string
      isMut?: boolean
      isSigner?: boolean
      optional?: boolean
      isOptional?: boolean
      address?: string
      accounts?: never
    }
  | { name: string; accounts: IdlAccountItem[] }

type FlatSpec = { name: string; optional: boolean; address?: string }

const defaults: Record<string, string> = {
  tokenProgram: TOKEN_PROGRAM_ID.toString(),
  token2022Program: TOKEN_2022_PROGRAM_ID.toString(),
  systemProgram: SystemProgram.programId.toString(),
}

const flattenIdlAccounts = (items: IdlAccountItem[]): FlatSpec[] => {
  const out: FlatSpec[] = []
  for (const it of items) {
    const group = (it as any).accounts
    if (Array.isArray(group)) out.push(...flattenIdlAccounts(group))
    else {
      const { name, optional, isOptional, address } = it as any
      out.push({ name, optional: Boolean(optional ?? isOptional), address })
    }
  }
  return out
}

export const mapAccountsByName = (
  idlIns: { accounts: IdlAccountItem[] },
  ix: PartialInstruction,
  keys: PublicKey[]
) => {
  const specs = flattenIdlAccounts(idlIns.accounts)
  const metas = ix.accounts
  const byName = new Map<string, number>()
  let cursor = 0

  for (const spec of specs) {
    if (cursor >= metas.length) {
      byName.set(spec.name, -1)
      continue
    }
    const idx = metas[cursor]
    const pk = keys[idx]?.toBase58()
    const expected = spec.address ?? defaults[spec.name]

    if (spec.optional && expected && pk !== expected) {
      byName.set(spec.name, -1) // omitted, don't consume a meta
      continue
    }
    byName.set(spec.name, idx)
    cursor++
  }
  return byName
}

export const resolveAddressTableKeys = async (
  lookups: AddressTableLookup[],
  connection: Connection
): Promise<PublicKey[]> => {
  const out: PublicKey[] = []
  for (const l of lookups ?? []) {
    const res = await connection.getAddressLookupTable(
      new PublicKey(l.accountKey)
    )
    const table = res.value?.state.addresses ?? []
    out.push(
      ...l.writableIndexes.map(i => table[i]),
      ...l.readonlyIndexes.map(i => table[i])
    )
  }
  return out
}
export const mergedKeys = (staticKeys: PublicKey[], loaded: PublicKey[]) => {
  return [...staticKeys, ...loaded]
}

export const mintFromTokenAccount = async (
  connection: Connection,
  ata: PublicKey
): Promise<string | null> => {
  if (ata === NATIVE_MINT) {
    return NATIVE_MINT.toBase58()
  }
  const info = await connection.getParsedAccountInfo(ata)
  return (info.value as any)?.data?.parsed?.info?.mint ?? null
}
