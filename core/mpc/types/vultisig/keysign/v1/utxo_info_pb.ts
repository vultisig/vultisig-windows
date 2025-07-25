// @generated by protoc-gen-es v2.4.0 with parameter "target=ts"
// @generated from file vultisig/keysign/v1/utxo_info.proto (package vultisig.keysign.v1, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from '@bufbuild/protobuf/codegenv1'
import { fileDesc, messageDesc } from '@bufbuild/protobuf/codegenv1'
import type { Message } from '@bufbuild/protobuf'

/**
 * Describes the file vultisig/keysign/v1/utxo_info.proto.
 */
export const file_vultisig_keysign_v1_utxo_info: GenFile =
  /*@__PURE__*/
  fileDesc(
    'CiN2dWx0aXNpZy9rZXlzaWduL3YxL3V0eG9faW5mby5wcm90bxITdnVsdGlzaWcua2V5c2lnbi52MSI3CghVdHhvSW5mbxIMCgRoYXNoGAEgASgJEg4KBmFtb3VudBgCIAEoAxINCgVpbmRleBgDIAEoDUJUChN2dWx0aXNpZy5rZXlzaWduLnYxWjhnaXRodWIuY29tL3Z1bHRpc2lnL2NvbW1vbmRhdGEvZ28vdnVsdGlzaWcva2V5c2lnbi92MTt2MboCAlZTYgZwcm90bzM'
  )

/**
 * @generated from message vultisig.keysign.v1.UtxoInfo
 */
export type UtxoInfo = Message<'vultisig.keysign.v1.UtxoInfo'> & {
  /**
   * @generated from field: string hash = 1;
   */
  hash: string

  /**
   * @generated from field: int64 amount = 2;
   */
  amount: bigint

  /**
   * @generated from field: uint32 index = 3;
   */
  index: number
}

/**
 * Describes the message vultisig.keysign.v1.UtxoInfo.
 * Use `create(UtxoInfoSchema)` to create a new message.
 */
export const UtxoInfoSchema: GenMessage<UtxoInfo> =
  /*@__PURE__*/
  messageDesc(file_vultisig_keysign_v1_utxo_info, 0)
