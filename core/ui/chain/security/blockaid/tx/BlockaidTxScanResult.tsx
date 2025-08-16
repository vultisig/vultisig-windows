import { BlockaidTxScanResult as BlockaidTxScanResultType } from '@core/chain/security/blockaid/tx/validation/core'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { Trans } from 'react-i18next'
import { useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { BlockaidRiskyTxOverlay } from './BlockaidRiskyTxOverlay'
import { BlockaidTxStatusContainer } from './BlockaidTxStatusContainer'
import { txRiskLevelIcon } from './TxRiskLevelIcon'
import { getRiskyTxColor } from './utils/color'

export const BlockaidTxScanResult = ({
  value,
}: ValueProp<BlockaidTxScanResultType>) => {
  const { colors } = useTheme()

  if (value) {
    const Icon = txRiskLevelIcon[value.level]

    const color = getRiskyTxColor(value.level, colors)

    return (
      <>
        <BlockaidRiskyTxOverlay value={value} />
        <Tooltip
          content={value.description}
          renderOpener={props => (
            <BlockaidTxStatusContainer
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
            </BlockaidTxStatusContainer>
          )}
        />
      </>
    )
  }

  return (
    <BlockaidTxStatusContainer>
      <CheckIcon color={colors.success.toCssValue()} />
      <Trans
        i18nKey="transaction_scanned"
        components={{ provider: <BlockaidLogo /> }}
      />
    </BlockaidTxStatusContainer>
  )
}
