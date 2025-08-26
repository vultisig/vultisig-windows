import api from '@clients/extension/src/utils/api'
import { OtherChain } from '@core/chain/Chain'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { VersionedTransaction } from '@solana/web3.js'

import { MessageKey, RequestMethod } from './constants'
import { ITransaction, Messaging } from './interfaces'

const isArray = (arr: any): arr is any[] => {
  return Array.isArray(arr)
}

const isObject = (obj: any): obj is Record<string, any> => {
  return obj === Object(obj) && !isArray(obj) && typeof obj !== 'function'
}

const toCamel = (value: string): string => {
  return value.replace(/([-_][a-z])/gi, $1 =>
    $1.toUpperCase().replace('-', '').replace('_', '')
  )
}

export const calculateWindowPosition = (
  currentWindow: chrome.windows.Window
) => {
  const height = 639
  const width = 496
  let left = 0
  let top = 0

  if (
    currentWindow &&
    currentWindow.left !== undefined &&
    currentWindow.top !== undefined &&
    currentWindow.width !== undefined
  ) {
    left = currentWindow.left + currentWindow.width - width
    top = currentWindow.top
  }

  return { height, left, top, width }
}

export const checkERC20Function = async (
  inputHex: string
): Promise<boolean> => {
  if (!inputHex || inputHex === '0x')
    return new Promise(resolve => resolve(false))

  const functionSelector = inputHex.slice(0, 10) // "0x" + 8 hex chars

  return await api.getIsFunctionSelector(functionSelector)
}

export const isPopupView = () => {
  return chrome?.extension?.getViews({ type: 'popup' }).length > 0
}

export const splitString = (str: string, size: number): string[] => {
  const result: string[] = []

  for (let i = 0; i < str.length; i += size) {
    result.push(str.slice(i, i + size))
  }

  return result
}

export const toCamelCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {}

    Object.keys(obj).forEach(k => {
      n[toCamel(k)] = toCamelCase(obj[k])
    })

    return n
  } else if (isArray(obj)) {
    return obj.map(i => {
      return toCamelCase(i)
    })
  }

  return obj
}

export const processBackgroundResponse = (
  data: Messaging.Chain.Request,
  messageKey: MessageKey,
  result: Messaging.Chain.Response
): Messaging.Chain.Response => {
  const handledMethods = [
    RequestMethod.CTRL.TRANSFER,
    RequestMethod.METAMASK.ETH_SEND_TRANSACTION,
    RequestMethod.VULTISIG.SEND_TRANSACTION,
    RequestMethod.CTRL.DEPOSIT,
    RequestMethod.VULTISIG.DEPOSIT_TRANSACTION,
  ]

  if (isOneOf(data.method, handledMethods)) {
    if (messageKey === MessageKey.SOLANA_REQUEST) {
      return shouldBeDefined(
        (result as ITransaction<OtherChain.Solana>).encoded
      )
    } else if (
      messageKey === MessageKey.COSMOS_REQUEST &&
      (data.params[0].txType === 'Vultisig' ||
        data.params[0].txType === 'Keplr')
    ) {
      return result
    }
    return shouldBePresent((result as ITransaction<OtherChain.Solana>).hash)
  }

  return result
}

export function isVersionedTransaction(tx: any): tx is VersionedTransaction {
  return (
    typeof tx === 'object' &&
    'version' in tx &&
    typeof tx.version === 'number' &&
    'message' in tx &&
    'addressTableLookups' in tx.message
  )
}

export const bytesEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  return arraysEqual(a, b)
}

type Indexed<T> = {
  length: number
  [index: number]: T
}

const arraysEqual = <T>(a: Indexed<T>, b: Indexed<T>): boolean => {
  if (a === b) return true

  const length = a.length
  if (length !== b.length) return false

  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}
