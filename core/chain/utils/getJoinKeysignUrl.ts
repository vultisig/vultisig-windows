import { create, toBinary } from '@bufbuild/protobuf'
import { toCompressedString } from '@core/chain/utils/protobuf/toCompressedString'
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { deepLinkBaseUrl } from '@core/config'
import { uploadPayloadToServer } from '@core/keygen/server/uploadPayloadToServer'
import { KeysignMessagePayload } from '@core/keysign/keysignPayload/KeysignMessagePayload'
import { getSevenZip } from '@core/mpc/compression/getSevenZip'
import { MpcServerType, mpcServerUrl } from '@core/mpc/MpcServerType'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { addQueryParams } from '@lib/utils/query/addQueryParams'

export type GetJoinKeysignUrlInput = {
  serverType: MpcServerType
  serviceName: string
  sessionId: string
  hexEncryptionKey: string
  payload?: KeysignMessagePayload
  payloadId?: string
  vaultId: string
}

const urlMaxLength = 2048

export const getJoinKeysignUrl = async ({
  serverType,
  serviceName,
  sessionId,
  hexEncryptionKey,
  payload,
  payloadId,
  vaultId,
}: GetJoinKeysignUrlInput): Promise<string> => {
  const keysignMessage = create(KeysignMessageSchema, {
    sessionId,
    serviceName: serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    payloadId,
  })

  if (payload) {
    matchRecordUnion(payload, {
      keysign: keysignPayload => {
        keysignMessage.keysignPayload = keysignPayload
      },
      custom: customPayload => {
        keysignMessage.customMessagePayload = customPayload
      },
    })
  }

  const binary = toBinary(KeysignMessageSchema, keysignMessage)

  const sevenZip = await getSevenZip()

  const jsonData = toCompressedString({
    sevenZip,
    binary,
  })

  const urlWithPayload = addQueryParams(deepLinkBaseUrl, {
    type: 'SignTransaction',
    vault: vaultId,
    jsonData,
  })

  if (payload && 'keysign' in payload && urlWithPayload.length > urlMaxLength) {
    const binary = toBinary(KeysignPayloadSchema, payload.keysign)
    const compressedPayload = toCompressedString({
      sevenZip,
      binary,
    })
    const payloadId = await uploadPayloadToServer({
      payload: compressedPayload,
      serverUrl: mpcServerUrl[serverType],
    })

    return getJoinKeysignUrl({
      serverType,
      serviceName,
      sessionId,
      hexEncryptionKey,
      payloadId,
      vaultId,
    })
  }

  return urlWithPayload
}
