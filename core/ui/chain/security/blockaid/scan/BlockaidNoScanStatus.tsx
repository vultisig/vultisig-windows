import { BlockaidScanEntity } from '@core/chain/security/blockaid/core/entity'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Trans, useTranslation } from 'react-i18next'

import { BlockaidLogo } from '../BlockaidLogo'
import { getBlockaidScanEntityName } from '../utils/entity'
import { BlockaidScanStatusContainer } from './BlockaidScanStatusContainer'

type BlockaidNoScanStatusProps = {
  entity: BlockaidScanEntity
}

export const BlockaidNoScanStatus = ({ entity }: BlockaidNoScanStatusProps) => {
  const { t } = useTranslation()

  return (
    <BlockaidScanStatusContainer>
      <TriangleAlertIcon />
      <Trans
        i18nKey="entity_not_scanned"
        values={{ entity: getBlockaidScanEntityName(entity, t) }}
        components={{
          provider: <BlockaidLogo />,
        }}
      />
    </BlockaidScanStatusContainer>
  )
}
