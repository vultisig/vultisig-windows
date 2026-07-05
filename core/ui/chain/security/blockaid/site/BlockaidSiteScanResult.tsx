import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'
import { BlockaidSiteScanResult as BlockaidSiteScanResultType } from '@vultisig/core-chain/security/blockaid/site/core'
import { Trans, useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { riskLevelIcon } from '../riskLevelIcon'
import { BlockaidScanStatusContainer } from '../scan/BlockaidScanStatusContainer'
import { getBlockaidScanEntityName } from '../utils/entity'
import { BlockaidSiteScanMaliciousOverlay } from './BlockaidSiteScanMaliciousOverlay'

type BlockaidSiteScanResultProps = ValueProp<BlockaidSiteScanResultType> & {
  domain: string
  onAcknowledgeRisk?: () => void
}

export const BlockaidSiteScanResult = ({
  value,
  domain,
  onAcknowledgeRisk,
}: BlockaidSiteScanResultProps) => {
  const { colors } = useTheme()
  const { t } = useTranslation()

  if (value) {
    const riskLevel: RiskLevel = 'high'

    const Icon = riskLevelIcon[riskLevel]

    return (
      <>
        <BlockaidSiteScanMaliciousOverlay
          domain={domain}
          onAcknowledgeRisk={onAcknowledgeRisk}
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
