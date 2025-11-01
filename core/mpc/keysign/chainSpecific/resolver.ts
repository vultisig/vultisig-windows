import { FeeSettings } from '@core/chain/feeQuote/settings/core'
import { Resolver } from '@lib/utils/types/Resolver'

import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import {
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from './KeysignChainSpecific'

type ValueForCase<C extends KeysignChainSpecificKey> = Extract<
  KeysignChainSpecific,
  { case: C }
>['value']

type FeeSettingsForCase<C extends KeysignChainSpecificKey> =
  C extends 'ethereumSpecific'
    ? FeeSettings<'evm'> | undefined
    : C extends 'utxoSpecific'
      ? FeeSettings<'utxo'> | undefined
      : undefined

type GetChainSpecificInput<C extends KeysignChainSpecificKey> = {
  keysignPayload: KeysignPayload
  feeSettings?: FeeSettingsForCase<C>
}

export type GetChainSpecificResolver<C extends KeysignChainSpecificKey> =
  Resolver<GetChainSpecificInput<C>, Promise<ValueForCase<C>>>
