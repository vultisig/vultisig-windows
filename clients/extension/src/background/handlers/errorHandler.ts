export class Exception extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export const EIP1193Errors = {
  4001: 'User rejected the request',
  4100: 'Unauthorized',
  4200: 'Unsupported method',
  4900: 'Provider disconnected',
  4901: 'Chain disconnected',
} as const
