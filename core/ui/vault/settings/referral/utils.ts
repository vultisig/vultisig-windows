import { blocksPerYear } from './constants'

export function regAmount({
  years,
  reg,
  perBlock,
}: {
  years: number
  reg: bigint
  perBlock: bigint
}) {
  return reg + perBlock * BigInt(years) * blocksPerYear
}

export function renewAmount({
  extra,
  perBlock,
}: {
  extra: number
  perBlock: bigint
}) {
  return perBlock * BigInt(extra) * blocksPerYear
}

export const buildMemo = ({
  name,
  chain,
  alias,
  owner,
  pref,
}: {
  name: string
  chain: string
  alias: string
  owner: string
  pref?: string
}) => ['~', name, chain, alias, owner, pref].filter(Boolean).join(':')
