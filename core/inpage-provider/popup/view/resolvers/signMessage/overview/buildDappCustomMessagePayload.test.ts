import { fromBinary, toBinary } from '@bufbuild/protobuf'
import { BridgeContext } from '@lib/extension/bridge/context'
import { Chain } from '@vultisig/core-chain/Chain'
import { CustomMessagePayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { describe, expect, it } from 'vitest'

import { buildDappCustomMessagePayload } from './buildDappCustomMessagePayload'

const topFrameContext: BridgeContext = {
  requestOrigin: 'https://app.example.org',
  requestName: 'Example dApp',
  requestFavicon: 'https://app.example.org/favicon.ico',
}

const buildPayload = (context: BridgeContext) =>
  buildDappCustomMessagePayload({
    method: 'personal_sign',
    message: '\x19Ethereum Signed Message:\n5hello',
    chain: Chain.Ethereum,
    vaultPublicKeyEcdsa: 'vault-id',
    context,
  })

describe('buildDappCustomMessagePayload', () => {
  it('carries the requesting dApp identity from the bridge context', () => {
    const { dappMetadata } = buildPayload(topFrameContext)

    expect(dappMetadata).toMatchObject({
      url: topFrameContext.requestOrigin,
      name: topFrameContext.requestName,
      iconUrl: topFrameContext.requestFavicon,
    })
  })

  // The bridge only reads the tab title and favicon for the top frame, so an
  // iframe request arrives with the origin alone.
  it('carries the origin alone when the request has no name or favicon', () => {
    const { dappMetadata } = buildPayload({
      requestOrigin: 'https://embedded.example.org',
    })

    expect(dappMetadata).toMatchObject({
      url: 'https://embedded.example.org',
      name: '',
      iconUrl: '',
    })
  })

  it('keeps the signed fields unchanged', () => {
    expect(buildPayload(topFrameContext)).toMatchObject({
      method: 'personal_sign',
      message: '\x19Ethereum Signed Message:\n5hello',
      chain: Chain.Ethereum,
      vaultPublicKeyEcdsa: 'vault-id',
    })
  })

  // Co-signers only ever see the decoded wire form.
  it('keeps the dApp identity across the wire encoding', () => {
    const decoded = fromBinary(
      CustomMessagePayloadSchema,
      toBinary(CustomMessagePayloadSchema, buildPayload(topFrameContext))
    )

    expect(decoded.dappMetadata).toMatchObject({
      url: topFrameContext.requestOrigin,
      name: topFrameContext.requestName,
      iconUrl: topFrameContext.requestFavicon,
    })
  })
})
