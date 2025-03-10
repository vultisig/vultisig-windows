import { create, toBinary } from '@bufbuild/protobuf'
import { toCompressedString } from '@core/chain/utils/protobuf/toCompressedString'
import { ReshareMessageSchema } from '@core/communication/vultisig/keygen/v1/reshare_message_pb'
import { deepLinkBaseUrl } from '@core/config'
import { getSevenZip } from '@core/keygen/compression/getSevenZip'
import { KeygenServerType } from '@core/keygen/server/KeygenServerType'
import { addQueryParams } from '@lib/utils/query/addQueryParams'

export type GetJoinReshareUrlInput = {
  serverType: KeygenServerType
  vaultName: string
  serviceName: string
  sessionId: string
  hexEncryptionKey: string
  hexChainCode: string
  publicKeyEcdsa: string
  oldResharePrefix?: string
  oldParties: string[]
  libType: string
}

export const getJoinReshareUrl = async ({
  serverType,
  vaultName,
  serviceName,
  sessionId,
  hexEncryptionKey,
  hexChainCode,
  publicKeyEcdsa,
  oldResharePrefix = '',
  oldParties,
  libType,
}: GetJoinReshareUrlInput) => {
  const keygenMessage = create(ReshareMessageSchema, {
    sessionId,
    hexChainCode,
    serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    vaultName: vaultName,
    publicKeyEcdsa,
    oldResharePrefix,
    oldParties,
    libType: libType == 'DKLS' ? 1 : 0,
  })
  const sevenZip = await getSevenZip()
  const binary = toBinary(ReshareMessageSchema, keygenMessage)

  const jsonData = await toCompressedString({ sevenZip, binary })

  return addQueryParams(deepLinkBaseUrl, {
    type: 'NewVault',
    tssType: 'Reshare',
    jsonData,
  })
}
