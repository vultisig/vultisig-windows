import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { formatAmount } from '@lib/utils/formatAmount'

import { truncateAddress } from '../../tools/shared/assetResolution'

export const formatTokenAmount = (raw: string, decimals: number): string => {
  if (!raw || raw === '<nil>') return '\u2014'

  const s = raw.replace(/^0+/, '') || '0'

  if (decimals <= 0) return s

  const padded = s.padStart(decimals + 1, '0')
  const intPart = padded.slice(0, padded.length - decimals)
  const fracPart = padded.slice(padded.length - decimals).replace(/0+$/, '')

  if (!fracPart) return intPart

  const trimmed = fracPart.length > 8 ? fracPart.slice(0, 8) : fracPart
  return `${intPart}.${trimmed}`
}

export const truncateHex = (hex: string): string => {
  if (hex.length <= 20) return hex
  return hex.slice(0, 10) + '\u2026' + hex.slice(-4)
}

export const getExplorerAddressUrl = (
  chain: Chain | null,
  address: string
): string | null => {
  if (!chain) return null
  return getBlockExplorerUrl({ chain, entity: 'address', value: address })
}

type DecodedParam = {
  type: string
  value: string
  formatted?: string
}

export type CalldataInfo = {
  functionSignature: string
  functionArguments: string
} | null

export type CalldataQuery = {
  data: CalldataInfo | undefined
  isPending: boolean
}

export const parseDecodedParams = (
  signature: string,
  argsJson: string,
  tokenDecimals?: number
): DecodedParam[] => {
  const paramsStr = signature.slice(
    signature.indexOf('(') + 1,
    signature.lastIndexOf(')')
  )
  if (!paramsStr) return []

  const types = paramsStr.split(',').map(t => t.trim())

  let values: string[] = []
  try {
    const parsed = JSON.parse(argsJson)
    if (Array.isArray(parsed)) {
      values = parsed.map(v => String(v))
    }
  } catch {
    return []
  }

  return types.map((type, i) => {
    const raw = values[i] ?? ''
    const param: DecodedParam = { type, value: raw }

    if (type === 'uint256' && raw && tokenDecimals !== undefined) {
      const maxUint256 =
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      if (raw === maxUint256) {
        param.formatted = 'Unlimited (Max uint256)'
      } else {
        const num = fromChainAmount(raw, tokenDecimals)
        param.formatted = formatAmount(num)
      }
    }

    if (type === 'address' && raw.length === 42) {
      param.formatted = truncateAddress(raw)
    }

    return param
  })
}
