import api from '@clients/extension/src/utils/api'
import {
  MessageKey,
  RequestMethod,
} from '@clients/extension/src/utils/constants'
import {
  Messaging,
  SendTransactionResponse,
} from '@clients/extension/src/utils/interfaces'

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

const toSnake = (value: string): string => {
  return value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export const bigintToByteArray = (bigNumber: bigint): Uint8Array => {
  if (typeof bigNumber !== 'bigint' || bigNumber < 0n)
    throw new Error('Input must be a non-negative BigInt.')

  const bytes = []

  while (bigNumber > 0n) {
    bytes.unshift(Number(bigNumber & 0xffn))
    bigNumber = bigNumber >> 8n
  }

  return new Uint8Array(bytes.length > 0 ? bytes : [0])
}

export const calculateWindowPosition = (
  currentWindow: chrome.windows.Window
) => {
  const height = 639
  const width = 376
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

export const toSnakeCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {}

    Object.keys(obj).forEach(k => {
      n[toSnake(k)] = toSnakeCase(obj[k])
    })

    return n
  } else if (isArray(obj)) {
    return obj.map(i => {
      return toSnakeCase(i)
    })
  }

  return obj
}

export const processBackgroundResponse = (
  data: Messaging.Chain.Request,
  messageKey: MessageKey,
  result: Messaging.Chain.Response
) => {
  switch (data.method) {
    case RequestMethod.CTRL.TRANSFER:
    case RequestMethod.METAMASK.ETH_SEND_TRANSACTION:
    case RequestMethod.VULTISIG.SEND_TRANSACTION:
    case RequestMethod.CTRL.DEPOSIT:
    case RequestMethod.VULTISIG.DEPOSIT_TRANSACTION:
    case RequestMethod.METAMASK.PERSONAL_SIGN:
    case RequestMethod.METAMASK.ETH_SIGN_TYPED_DATA_V4: {
      if (messageKey === MessageKey.SOLANA_REQUEST)
        return (result as SendTransactionResponse).raw
      return (result as SendTransactionResponse).txResponse
    }
    default: {
      return result
    }
  }
}
