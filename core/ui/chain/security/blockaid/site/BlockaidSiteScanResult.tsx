import { RiskLevel } from '@core/chain/security/blockaid/core/riskLevel'
import { BlockaidSiteScanResult as BlockaidSiteScanResultType } from '@core/chain/security/blockaid/site/core'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { Trans, useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { BlockaidOverlay } from '../BlockaidOverlay'
import { riskLevelIcon } from '../riskLevelIcon'
import { BlockaidScanStatusContainer } from '../scan/BlockaidScanStatusContainer'
import { getBlockaidScanEntityName } from '../utils/entity'

export const BlockaidSiteScanResult = ({
  value,
}: ValueProp<BlockaidSiteScanResultType>) => {
  const { colors } = useTheme()
  const { t } = useTranslation()

  if (value) {
    const riskLevel: RiskLevel = 'high'

    const Icon = riskLevelIcon[riskLevel]

    return (
      <>
        <BlockaidOverlay
          riskLevel={riskLevel}
          title={t('risky_site_detected')}
        />
        <BlockaidScanStatusContainer
          style={{
            color: colors.danger.toCssValue(),
          }}
        >
          <Icon />
          <Trans
            i18nKey="site_has_risk"
            components={{ provider: <BlockaidLogo /> }}
          />
        </BlockaidScanStatusContainer>
      </>
    )
  }

  return (
    <BlockaidScanStatusContainer>
      <CheckIcon color={colors.success.toCssValue()} />
      <Trans
        i18nKey="entity_scanned"
        values={{ entity: getBlockaidScanEntityName('site', t) }}
        components={{ provider: <BlockaidLogo /> }}
      />
    </BlockaidScanStatusContainer>
  )
}
