import { BlockaidTxScanResult as BlockaidTxScanResultType } from '@core/chain/security/blockaid/tx/scan'
import { Match } from '@lib/ui/base/Match'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { ValueProp } from '@lib/ui/props'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { match } from '@lib/utils/match'
import { Trans } from 'react-i18next'
import { useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { BlockaidTxStatusContainer } from './BlockaidTxStatusContainer'

export const BlockaidTxScanResult = ({
  value,
}: ValueProp<BlockaidTxScanResultType>) => {
  const { colors } = useTheme()

  if (value) {
    return (
      <Tooltip
        content={value.description}
        renderOpener={props => (
          <BlockaidTxStatusContainer
            {...props}
            style={{
              color: match(value.level, {
                medium: () => colors.idle,
                high: () => colors.danger,
              }).toCssValue(),
            }}
          >
            <Match
              value={value.level}
              medium={() => <CircleAlertIcon />}
              high={() => <TriangleAlertIcon />}
            />
            <Trans
              i18nKey="transaction_has_risk"
              components={{ provider: <BlockaidLogo /> }}
              values={{ riskLevel: capitalizeFirstLetter(value.level) }}
            />
          </BlockaidTxStatusContainer>
        )}
      />
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
