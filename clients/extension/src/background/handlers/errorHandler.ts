const errors = {
  4001: 'User rejected the request',
  4100: 'Unauthorized',
  4200: 'Unsupported method',
  4900: 'Provider disconnected',
  4901: 'Chain disconnected',
} as const

export class EIP1193Error extends Error {
  code: number

  constructor(code: keyof typeof errors) {
    super(errors[code])
    this.code = code
  }
}
