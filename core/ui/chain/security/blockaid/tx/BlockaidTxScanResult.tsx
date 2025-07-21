import { TxRiskLevel } from '@core/chain/security/blockaid/tx/scan'
import { Match } from '@lib/ui/base/Match'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { matchColor } from '@lib/ui/theme/getters'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { Trans } from 'react-i18next'
import { styled, useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { BlockaidTxStatusContainer } from './BlockaidTxStatusContainer'

type BlockaidTxScanResultProps = {
  riskLevel: TxRiskLevel
}

const Container = styled(BlockaidTxStatusContainer)<BlockaidTxScanResultProps>`
  color: ${matchColor('riskLevel', {
    low: 'text',
    medium: 'idle',
    high: 'danger',
  })};
`

export const BlockaidTxScanResult = ({
  riskLevel,
}: BlockaidTxScanResultProps) => {
  const { colors } = useTheme()
  return (
    <Container riskLevel={riskLevel}>
      <Match
        value={riskLevel}
        low={() => <CheckIcon color={colors.success.toCssValue()} />}
        medium={() => <CircleAlertIcon color={colors.idle.toCssValue()} />}
        high={() => <TriangleAlertIcon color={colors.danger.toCssValue()} />}
      />
      {riskLevel === 'low' ? (
        <Trans
          i18nKey="transaction_scanned"
          components={{ provider: <BlockaidLogo /> }}
        />
      ) : (
        <Trans
          i18nKey="transaction_has_risk"
          components={{ provider: <BlockaidLogo /> }}
          values={{ riskLevel: capitalizeFirstLetter(riskLevel) }}
        />
      )}
    </Container>
  )
}
