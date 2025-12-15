import { JsonObject, JsonValue } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'

type ParsedConfigurationRow = {
  key: string
  value: string
}

type FlattenJsonInput = {
  value: JsonValue
  path?: string
}

type FillEmptyTokenWithNativeTickerInput = {
  rows: ParsedConfigurationRow[]
  chainKey: string
  tokenKey: string
}

const joinPath = ({ base, key }: { base: string; key: string }) =>
  base ? `${base}_${key}` : key

const leafToString = (value: null | string | number | boolean) =>
  value === null ? 'null' : String(value)

const flattenJson = ({
  value,
  path = '',
}: FlattenJsonInput): ParsedConfigurationRow[] => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return [{ key: path, value: leafToString(value) }]
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [{ key: path, value: '[]' }]
    return value.flatMap((item, index) =>
      flattenJson({ value: item, path: `${path}[${index}]` })
    )
  }

  const entries = Object.entries(value)
  if (entries.length === 0) return [{ key: path, value: '{}' }]

  return entries.flatMap(([k, v]) =>
    flattenJson({ value: v, path: joinPath({ base: path, key: k }) })
  )
}

const getChainFeeTicker = (chainName: string): string | null => {
  const chains = Object.values(Chain)
  if (!isOneOf(chainName, chains)) return null

  return chainFeeCoin[chainName].ticker
}

const fillEmptyTokenWithNativeTicker = ({
  rows,
  chainKey,
  tokenKey,
}: FillEmptyTokenWithNativeTickerInput): ParsedConfigurationRow[] => {
  const tokenIndex = rows.findIndex(r => r.key === tokenKey)
  if (tokenIndex === -1) return rows
  if (rows[tokenIndex].value !== '') return rows

  const chainRow = rows.find(r => r.key === chainKey)
  if (!chainRow) return rows

  const ticker = getChainFeeTicker(chainRow.value)
  if (!ticker) return rows

  const next = [...rows]
  next[tokenIndex] = { ...next[tokenIndex], value: ticker }
  return next
}

export const parseConfiguration = (
  configuration: JsonObject
): ParsedConfigurationRow[] => {
  const rows = flattenJson({ value: configuration }).filter(
    row => row.key !== ''
  )

  return fillEmptyTokenWithNativeTicker({
    rows: fillEmptyTokenWithNativeTicker({
      rows,
      chainKey: 'from_chain',
      tokenKey: 'from_token',
    }),
    chainKey: 'to_chain',
    tokenKey: 'to_token',
  })
}
