import { BlockaidTxScanResult as BlockaidTxScanResultType } from '@core/chain/security/blockaid/tx/core'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { Trans, useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { BlockaidOverlay } from '../BlockaidOverlay'
import { riskLevelIcon } from '../riskLevelIcon'
import { BlockaidScanStatusContainer } from '../scan/BlockaidScanStatusContainer'
import { getBlockaidScanEntityName } from '../utils/entity'
import { getRiskyTxColor } from './utils/color'

export const BlockaidTxScanResult = ({
  value,
}: ValueProp<BlockaidTxScanResultType>) => {
  const { colors } = useTheme()

  const { t } = useTranslation()

  if (value) {
    const Icon = riskLevelIcon[value.level]

    const color = getRiskyTxColor(value.level, colors)

    return (
      <>
        <BlockaidOverlay
          riskLevel={value.level}
          description={value.description}
          title={t('risky_transaction_detected', {
            riskLevel: capitalizeFirstLetter(value.level),
          })}
        />
        <Tooltip
          content={value.description}
          renderOpener={props => (
            <BlockaidScanStatusContainer
              {...props}
              style={{
                color,
              }}
            >
              <Icon />
              <Trans
                i18nKey="transaction_has_risk"
                components={{ provider: <BlockaidLogo /> }}
                values={{ riskLevel: capitalizeFirstLetter(value.level) }}
              />
            </BlockaidScanStatusContainer>
          )}
        />
      </>
    )
  }

  return (
    <BlockaidScanStatusContainer>
      <CheckIcon color={colors.success.toCssValue()} />
      <Trans
        i18nKey="entity_scanned"
        values={{ entity: getBlockaidScanEntityName('tx', t) }}
        components={{ provider: <BlockaidLogo /> }}
      />
    </BlockaidScanStatusContainer>
  )
}
