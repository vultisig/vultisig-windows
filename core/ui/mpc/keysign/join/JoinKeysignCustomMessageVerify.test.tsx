import { create } from '@bufbuild/protobuf'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import {
  CustomMessagePayload,
  CustomMessagePayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { renderToString } from 'react-dom/server'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { JoinKeysignCustomMessageVerify } from './JoinKeysignCustomMessageVerify'

const render = (value: CustomMessagePayload) =>
  renderToString(
    <ThemeProvider theme={darkTheme}>
      <JoinKeysignCustomMessageVerify value={value} />
    </ThemeProvider>
  )

const signedFields = {
  method: 'personal_sign',
  message: 'Sign in to Example',
  vaultPublicKeyEcdsa: 'vault-id',
}

describe('JoinKeysignCustomMessageVerify', () => {
  it('leads with the requesting dApp when the message came from one', () => {
    const html = render(
      create(CustomMessagePayloadSchema, {
        ...signedFields,
        dappMetadata: {
          name: 'Example dApp',
          url: 'https://app.example.org',
          iconUrl: 'https://app.example.org/favicon.ico',
        },
      })
    )

    expect(html).toContain('request_from')
    expect(html).toContain('Example dApp')
    expect(html).toContain('app.example.org')
    expect(html.indexOf('request_from')).toBeLessThan(
      html.indexOf(signedFields.message)
    )
  })

  it('shows the message alone when no dApp asked for it', () => {
    const html = render(create(CustomMessagePayloadSchema, signedFields))

    expect(html).not.toContain('request_from')
    expect(html).toContain(signedFields.message)
  })
})
