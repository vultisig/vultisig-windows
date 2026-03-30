import { BlockaidScanEntity } from '@vultisig/core-chain/security/blockaid/core/entity'
import { match } from '@vultisig/lib-utils/match'
import { TFunction } from 'i18next'

export const getBlockaidScanEntityName = (
  entity: BlockaidScanEntity,
  t: TFunction
) =>
  match(entity, {
    tx: () => t('transaction'),
    site: () => t('site'),
  })
