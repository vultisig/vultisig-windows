import { describe, expect, it } from 'vitest'

import {
  findI18nSyntaxIssues,
  findTranslationIntegrityIssues,
  protectInterpolationTokens,
} from './i18nSyntax'

describe('i18n syntax integrity', () => {
  it('detects translated interpolation names', () => {
    expect(
      findI18nSyntaxIssues({
        key: 'banner_carousel_go_to_banner',
        locale: 'es',
        source: 'Go to banner {{number}}',
        target: 'Ir al banner {{número}}',
      })
    ).toEqual([
      {
        key: 'banner_carousel_go_to_banner',
        locale: 'es',
        kind: 'interpolation',
        missing: ['number'],
        extra: ['número'],
      },
    ])
  })

  it('detects translated Trans component tags', () => {
    expect(
      findI18nSyntaxIssues({
        key: 'powered_by',
        locale: 'pt',
        source: 'Powered by <provider></provider>',
        target: 'Alimentado por <provedor></provedor>',
      })
    ).toEqual([
      {
        key: 'powered_by',
        locale: 'pt',
        kind: 'tag',
        missing: ['provider', '/provider'],
        extra: ['provedor', '/provedor'],
      },
    ])
  })

  it('detects preserved tags that lost their styled content', () => {
    expect(
      findI18nSyntaxIssues({
        key: 'upgrade_success',
        locale: 'es',
        source: 'Vault upgraded <b>successfully</b>',
        target: 'Vault actualizado correctamente <b> </b>',
      })
    ).toEqual([
      {
        key: 'upgrade_success',
        locale: 'es',
        kind: 'tag-content',
        missing: ['b'],
        extra: [],
      },
    ])
  })

  it('checks nested locale records for missing keys and syntax drift', () => {
    expect(
      findTranslationIntegrityIssues({
        locale: 'nl',
        source: {
          banner: {
            goTo: 'Go to banner {{number}}',
          },
          powered_by: 'Powered by <provider></provider>',
        },
        target: {
          banner: {
            goTo: 'Ga naar banner {{nummer}}',
          },
        },
      })
    ).toEqual([
      {
        key: 'banner.goTo',
        locale: 'nl',
        kind: 'interpolation',
        missing: ['number'],
        extra: ['nummer'],
      },
      {
        key: 'powered_by',
        locale: 'nl',
        kind: 'missing-key',
      },
    ])
  })

  it('protects interpolation placeholders before machine translation', () => {
    const protectedText = protectInterpolationTokens(
      'Not enough {{asset}} to cover {{feeType}} fees'
    )

    expect(protectedText.text).toBe(
      'Not enough X_I18N_TOKEN_0_X to cover X_I18N_TOKEN_1_X fees'
    )
    expect(
      protectedText.restore(
        'X_I18N_TOKEN_0_X insuficiente para cobrir taxas de X_I18N_TOKEN_1_X'
      )
    ).toBe('{{asset}} insuficiente para cobrir taxas de {{feeType}}')
  })
})
