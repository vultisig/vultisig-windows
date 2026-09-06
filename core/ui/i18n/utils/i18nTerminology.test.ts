import { describe, expect, it } from 'vitest'

import { languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import { findTerminologyIssues } from './i18nTerminology'
import { flattenTranslationRecord } from './translationRecords'

describe('i18n terminology', () => {
  it('flags a Chinese crypto token translated as an auth token', () => {
    expect(
      findTerminologyIssues({
        key: 'custom_token',
        locale: 'zh',
        source: 'Custom Token',
        target: '自定义令牌',
      })
    ).toEqual([
      {
        key: 'custom_token',
        locale: 'zh',
        kind: 'terminology',
        bannedTerm: '令牌',
        note: expect.stringContaining('代币'),
      },
    ])
  })

  it('accepts the term the native apps ship', () => {
    expect(
      findTerminologyIssues({
        key: 'custom_token',
        locale: 'zh',
        source: 'Custom Token',
        target: '自定义代币',
      })
    ).toEqual([])
  })

  it('matches the source term regardless of case or plural', () => {
    expect(
      findTerminologyIssues({
        key: 'no_tokens_found',
        locale: 'zh',
        source: 'No tokens found',
        target: '未找到令牌',
      })
    ).toHaveLength(1)
  })

  it('leaves the banned word alone when the source is not about tokens', () => {
    expect(
      findTerminologyIssues({
        key: 'session_expired',
        locale: 'zh',
        source: 'Your session expired',
        target: '您的令牌已过期',
      })
    ).toEqual([])
  })

  it('does not constrain locales the rule says nothing about', () => {
    expect(
      findTerminologyIssues({
        key: 'custom_token',
        locale: 'es',
        source: 'Custom Token',
        target: '令牌',
      })
    ).toEqual([])
  })

  it('holds across every shipped locale', () => {
    const source = flattenTranslationRecord({
      record: translations[primaryLanguage],
    })

    const issues = languages
      .filter(language => language !== primaryLanguage)
      .flatMap(language =>
        [
          ...flattenTranslationRecord({ record: translations[language] }),
        ].flatMap(([key, target]) => {
          const sourceText = source.get(key)

          return sourceText === undefined
            ? []
            : findTerminologyIssues({
                key,
                locale: language,
                source: sourceText,
                target,
              })
        })
      )

    expect(issues).toEqual([])
  })
})
