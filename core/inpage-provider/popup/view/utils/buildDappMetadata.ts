import { create } from '@bufbuild/protobuf'
import { BridgeContext } from '@lib/extension/bridge/context'
import {
  DAppMetadata,
  DAppMetadataSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/dapp_metadata_pb'

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
