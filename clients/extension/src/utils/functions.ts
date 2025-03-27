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
