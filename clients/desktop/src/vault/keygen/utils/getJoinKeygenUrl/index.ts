import { create, toBinary } from '@bufbuild/protobuf'
import { KeygenMessageSchema } from '@core/communication/vultisig/keygen/v1/keygen_message_pb'
import { MpcLib } from '@core/mpc/mpcLib'
import { MpcServerType } from '@core/mpc/MpcServerType'
import { addQueryParams } from '@lib/utils/query/addQueryParams'

import { deepLinkBaseUrl } from '../../../../deeplink/config'
import { toCompressedString } from '../../../../utils/protobuf/toCompressedString'

export type GetJoinKeygenUrlInput = {
  serverType: MpcServerType
  vaultName: string
  serviceName: string
  sessionId: string
  hexEncryptionKey: string
  hexChainCode: string
  mpcLibType: MpcLib
}

export const getJoinKeygenUrl = async ({
  serverType,
  vaultName,
  serviceName,
  sessionId,
  hexEncryptionKey,
  hexChainCode,
  mpcLibType,
}: GetJoinKeygenUrlInput) => {
  const keygenMessage = create(KeygenMessageSchema, {
    sessionId,
    hexChainCode,
    serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    vaultName: vaultName,
    libType: mpcLibType === 'GG20' ? 0 : 1,
  })

  const binary = toBinary(KeygenMessageSchema, keygenMessage)

  const jsonData = await toCompressedString(binary)

  return addQueryParams(deepLinkBaseUrl, {
    type: 'NewVault',
    tssType: 'Keygen',
    jsonData,
  })
}
