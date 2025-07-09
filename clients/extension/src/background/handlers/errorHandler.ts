const codes = [4001, 4100, 4200, 4900, 4901] as const

const errors: Record<Code, string> = {
  4001: 'User rejected the request',
  4100: 'Unauthorized',
  4200: 'Unsupported method',
  4900: 'Provider disconnected',
  4901: 'Chain disconnected',
}

type Code = (typeof codes)[number]

export class EIP1193Error extends Error {
  code: number

  constructor(code: Code) {
    super(errors[code])
    this.code = code
  }
}
