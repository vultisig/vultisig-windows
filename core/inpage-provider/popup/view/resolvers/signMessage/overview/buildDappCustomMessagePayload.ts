import { create } from '@bufbuild/protobuf'
import { BridgeContext } from '@lib/extension/bridge/context'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  CustomMessagePayload,
  CustomMessagePayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'

import { buildDappMetadata } from '../../../utils/buildDappMetadata'

type BuildDappCustomMessagePayloadInput = {
  method: string
  message: string
  chain: Chain
  vaultPublicKeyEcdsa: string
  context: BridgeContext
}

/**
 * Custom-message keysign payload for a dApp signing request. Carries the
 * requesting dApp's identity through the same builder dApp transactions use,
 * so co-signing devices see who asked regardless of the payload kind.
 */
export const buildDappCustomMessagePayload = ({
  method,
  message,
  chain,
  vaultPublicKeyEcdsa,
  context,
}: BuildDappCustomMessagePayloadInput): CustomMessagePayload =>
  create(CustomMessagePayloadSchema, {
    method,
    message,
    chain,
    vaultPublicKeyEcdsa,
    dappMetadata: buildDappMetadata(context),
  })
