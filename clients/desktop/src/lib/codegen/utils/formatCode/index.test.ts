import prettier from 'prettier'
import { describe, expect, it, vi } from 'vitest'

import { formatCode } from '.'

vi.mock('prettier', async () => {
  const actualPrettier = await vi.importActual<typeof prettier>('prettier')
  return {
    ...actualPrettier,
    resolveConfig: vi.fn().mockResolvedValue({
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      tabWidth: 2,
      printWidth: 20,
    }),
  }
})

describe('formatCode', () => {
  it('should format JSON code correctly', async () => {
    const unformattedJson = `{"name":"John","age":30,"city":"New York"}`
    const formattedJson = await formatCode({
      extension: 'json',
      content: unformattedJson,
    })

    const expectedFormattedJson = `{
  "name": "John",
  "age": 30,
  "city": "New York"
}
`

    expect(formattedJson).toBe(expectedFormattedJson)
  })

  it('should throw an error for unsupported extensions', async () => {
    await expect(
      formatCode({ extension: 'md' as any, content: 'Some content' })
    ).rejects.toThrow()
  })
})
