type Code = 4001 | 4100 | 4200 | 4900 | 4901 | -32600 | -32601 | -32602 | -32603

const errors: Record<Code, string> = {
  4001: 'User rejected the request',
  4100: 'Unauthorized',
  4200: 'Unsupported method',
  4900: 'Provider disconnected',
  4901: 'Chain disconnected',
  [-32600]: 'Invalid Request',
  [-32601]: 'Method not found',
  [-32602]: 'Invalid params',
  [-32603]: 'Internal error',
} as const

export class EIP1193Error extends Error {
  code: number

  constructor(code: Code) {
    super(errors[code])
    this.code = code
  }
}
