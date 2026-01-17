import { create, toBinary } from '@bufbuild/protobuf'
import { toCompressedString } from '@core/chain/utils/protobuf/toCompressedString'
import { deepLinkBaseUrl } from '@core/config'
import { getSevenZip } from '@core/mpc/compression/getSevenZip'
import { uploadPayloadToServer } from '@core/mpc/keygen/server/uploadPayloadToServer'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { MpcServerType, mpcServerUrl } from '@core/mpc/MpcServerType'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { addQueryParams } from '@lib/utils/query/addQueryParams'

export type GetJoinKeysignUrlInput = {
  serverType: MpcServerType
  serviceName: string
  sessionId: string
  hexEncryptionKey: string
  payload?: KeysignMessagePayload
  payloadId?: string
  customPayloadId?: string
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
  customPayloadId,
  vaultId,
}: GetJoinKeysignUrlInput): Promise<string> => {
  const keysignMessage = create(KeysignMessageSchema, {
    sessionId,
    serviceName: serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    payloadId,
    customPayloadId,
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

  if (payload && urlWithPayload.length > urlMaxLength) {
    if ('keysign' in payload) {
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

    if ('custom' in payload) {
      const binary = toBinary(CustomMessagePayloadSchema, payload.custom)
      const compressedPayload = toCompressedString({
        sevenZip,
        binary,
      })
      const customPayloadId = await uploadPayloadToServer({
        payload: compressedPayload,
        serverUrl: mpcServerUrl[serverType],
      })

      return getJoinKeysignUrl({
        serverType,
        serviceName,
        sessionId,
        hexEncryptionKey,
        customPayloadId,
        vaultId,
      })
    }
  }

  return urlWithPayload
}
