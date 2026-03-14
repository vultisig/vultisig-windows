import { VaultKeyGroup } from '@core/chain/signing/VaultKeyGroup'

import { ReshareType } from './ReshareType'

export type KeygenOperation =
  | { create: true }
  | { reshare: ReshareType }
  | { keyimport: true }
  | { addChainKeys: VaultKeyGroup }
  | { singleKeygen: true }
