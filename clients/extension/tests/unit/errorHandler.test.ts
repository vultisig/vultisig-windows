import { describe, expect, it } from 'vitest'

import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'

describe('EIP1193Error', () => {
  const errorCases: Array<{
    type: Parameters<typeof EIP1193Error.prototype.constructor>[0]
    expectedCode: number
    expectedMessage: string
  }> = [
    { type: 'UserRejectedRequest', expectedCode: 4001, expectedMessage: 'User rejected the request' },
    { type: 'Unauthorized', expectedCode: 4100, expectedMessage: 'Unauthorized' },
    { type: 'UnsupportedMethod', expectedCode: 4200, expectedMessage: 'Unsupported method' },
    { type: 'ProviderDisconnected', expectedCode: 4900, expectedMessage: 'Provider disconnected' },
    { type: 'ChainDisconnected', expectedCode: 4901, expectedMessage: 'Chain disconnected' },
    { type: 'InvalidRequest', expectedCode: -32600, expectedMessage: 'Invalid Request' },
    { type: 'MethodNotFound', expectedCode: -32601, expectedMessage: 'Method not found' },
    { type: 'InvalidParams', expectedCode: -32602, expectedMessage: 'Invalid params' },
    { type: 'InternalError', expectedCode: -32603, expectedMessage: 'Internal error' },
    { type: 'UnrecognizedChain', expectedCode: 4902, expectedMessage: 'Unrecognized chain ID' },
  ]

  it.each(errorCases)(
    'maps $type → code $expectedCode',
    ({ type, expectedCode, expectedMessage }) => {
      const error = new EIP1193Error(type as any)

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(EIP1193Error)
      expect(error.code).toBe(expectedCode)
      expect(error.message).toBe(expectedMessage)
    }
  )

  it('extends Error and has proper prototype chain', () => {
    const error = new EIP1193Error('InternalError' as any)
    expect(error instanceof Error).toBe(true)
    expect(error.name).toBe('Error')
  })

  it('can be caught as Error', () => {
    expect(() => {
      throw new EIP1193Error('UserRejectedRequest' as any)
    }).toThrow(Error)
  })

  it('has a stack trace', () => {
    const error = new EIP1193Error('MethodNotFound' as any)
    expect(error.stack).toBeDefined()
    expect(error.stack!.length).toBeGreaterThan(0)
  })
})
