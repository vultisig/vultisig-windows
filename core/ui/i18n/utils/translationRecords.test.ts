import { describe, expect, it } from 'vitest'

import {
  flattenTranslationRecord,
  readTranslationRecordFromSource,
} from './translationRecords'

describe('translation record parsing', () => {
  it('reads and flattens nested locale object literals', () => {
    const record = readTranslationRecordFromSource({
      exportName: 'en',
      fileName: 'en.ts',
      source: `
        export const en = {
          backup: 'Backup',
          nested: {
            title: 'Vault {{count}}',
            styled: 'Keep <b>safe</b>',
          },
        }
      `,
    })

    expect(Object.fromEntries(flattenTranslationRecord({ record }))).toEqual({
      backup: 'Backup',
      'nested.title': 'Vault {{count}}',
      'nested.styled': 'Keep <b>safe</b>',
    })
  })
})
