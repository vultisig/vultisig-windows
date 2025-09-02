import { match } from '@lib/utils/match'
import { TFunction } from 'i18next'

export type BlockaidScanEntity = 'tx' | 'site'

export const getBlockaidScanEntityName = (
  entity: BlockaidScanEntity,
  t: TFunction
) =>
  match(entity, {
    tx: () => t('transaction'),
    site: () => t('site'),
  })
