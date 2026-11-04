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
vi.mock('@core/ui/state/core', () => ({
  useCore: () => ({ version: '1.0.0', goHome: () => {} }),
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => ({}),
}))
vi.mock('@core/ui/mpc/keysign/action/mutations/useKeysignMutation', () => ({
  useKeysignMutation: () => ({
    mutate: () => {},
    data: { signature: '0xsignature' },
    error: null,
    isPending: false,
    isError: false,
    isSuccess: true,
  }),
}))
vi.mock('@core/ui/mpc/keysign/custom/KeysignCustomMessageInfo', () => ({
  KeysignCustomMessageInfo: ({ value }: { value: CustomMessagePayload }) =>
    value.message,
}))
vi.mock('@core/ui/mpc/keysign/tx/KeysignTxDoneScreen', () => ({
  KeysignTxDoneScreen: () => null,
}))
vi.mock('@core/ui/mpc/keysign/tx/swap/SwapKeysignTxOverview', () => ({
  SwapKeysignTxOverview: () => null,
}))

import { KeysignSigningStep } from './KeysignSigningStep'
import { KeysignMessagePayloadProvider } from './state/keysignMessagePayload'

const render = (custom: CustomMessagePayload) =>
  renderToString(
    <ThemeProvider theme={darkTheme}>
      <KeysignMessagePayloadProvider value={{ custom }}>
        <KeysignSigningStep />
      </KeysignMessagePayloadProvider>
    </ThemeProvider>
  )

const signedFields = {
  method: 'personal_sign',
  message: 'Sign in to Example',
  vaultPublicKeyEcdsa: 'vault-id',
}

describe('KeysignSigningStep custom-message done screen', () => {
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

  it('shows no banner for a manually typed message', () => {
    const html = render(create(CustomMessagePayloadSchema, signedFields))

    expect(html).not.toContain('request_from')
    expect(html).toContain(signedFields.message)
  })
})
