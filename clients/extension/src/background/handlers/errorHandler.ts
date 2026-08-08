type Type =
  | 'UserRejectedRequest'
  | 'Unauthorized'
  | 'UnsupportedMethod'
  | 'ProviderDisconnected'
  | 'ChainDisconnected'
  | 'InvalidRequest'
  | 'MethodNotFound'
  | 'InvalidParams'
  | 'InternalError'
  | 'UnrecognizedChain'

const errors: Record<Type, { code: number; message: string }> = {
  UserRejectedRequest: {
    code: 4001,
    message: 'User rejected the request',
  },
  Unauthorized: {
    code: 4100,
    message: 'Unauthorized',
  },
  UnsupportedMethod: {
    code: 4200,
    message: 'Unsupported method',
  },
  ProviderDisconnected: {
    code: 4900,
    message: 'Provider disconnected',
  },
  ChainDisconnected: {
    code: 4901,
    message: 'Chain disconnected',
  },
  InvalidRequest: {
    code: -32600,
    message: 'Invalid Request',
  },
  MethodNotFound: {
    code: -32601,
    message: 'Method not found',
  },
  InvalidParams: {
    code: -32602,
    message: 'Invalid params',
  },
  InternalError: {
    code: -32603,
    message: 'Internal error',
  },
  UnrecognizedChain: { code: 4902, message: 'Unrecognized chain ID' },
} as const

type EIP1193ErrorInit = {
  code: number
  message: string
  data?: unknown
}

/**
 * EIP-1193 §5.4 `ProviderRpcError`. Construct from a named `Type` for the
 * standard codes, or from an explicit `{ code, message, data? }` to preserve
 * upstream error shapes (e.g. JSON-RPC node errors with revert `data`).
 */
export class EIP1193Error extends Error {
  code: number
  data?: unknown

  constructor(typeOrInit: Type | EIP1193ErrorInit, customMessage?: string) {
    if (typeof typeOrInit === 'string') {
      super(customMessage ?? errors[typeOrInit].message)
      this.code = errors[typeOrInit].code
      return
    }
    super(typeOrInit.message)
    this.code = typeOrInit.code
    if (typeOrInit.data !== undefined) {
      this.data = typeOrInit.data
    }
  }
}
