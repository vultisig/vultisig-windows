import { create } from '@bufbuild/protobuf'
import { BridgeContext } from '@lib/extension/bridge/context'
import {
  DAppMetadata,
  DAppMetadataSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/dapp_metadata_pb'

/**
 * Identity of the requesting dApp, attached to both transaction and
 * custom-message keysign payloads so every co-signing device can show it.
 * Display-only: `url` is the browser-attested sender origin, while `name` and
 * `iconUrl` are the tab title and favicon, which the page controls.
 */
export const buildDappMetadata = ({
  requestFavicon,
  requestName,
  requestOrigin,
}: BridgeContext): DAppMetadata =>
  create(DAppMetadataSchema, {
    name: requestName ?? '',
    url: requestOrigin,
    iconUrl: requestFavicon ?? '',
  })
