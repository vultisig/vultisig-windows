import { TxRiskLevel } from '@core/chain/security/blockaid/tx/scan'
import { Match } from '@lib/ui/base/Match'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { matchColor } from '@lib/ui/theme/getters'
import { Trans } from 'react-i18next'
import { styled } from 'styled-components'

import { BlockaidLogo } from '../logo'
import { BlockaidTxStatusContainer } from './statusContainer'

type BlockaidTxScanResultProps = {
  riskLevel: TxRiskLevel
}

const Container = styled(BlockaidTxStatusContainer)<BlockaidTxScanResultProps>`
  &:first-child {
    color: ${matchColor('riskLevel', {
      low: 'success',
      medium: 'warning',
      high: 'error',
    })};
  }
  color: ${matchColor('riskLevel', {
    low: 'regular',
    medium: 'warning',
    high: 'error',
  })};
`

const riskLevelIcon: Record<TxRiskLevel, React.ReactNode> = {
  low: <CheckIcon />,
  medium: <CircleAlertIcon />,
  high: <TriangleAlertIcon />,
}

export const BlockaidTxScanResult = ({
  riskLevel,
}: BlockaidTxScanResultProps) => {
  return (
    <Container riskLevel={riskLevel}>
      {riskLevelIcon[riskLevel]}
      <Match
        value={riskLevel}
        low={() => (
          <Trans
            i18nKey="transaction_scanned"
            components={{
              provider: <BlockaidLogo />,
            }}
          />
        )}
        medium={() => (
          <Trans
            i18nKey="transaction_has_risk"
            components={{
              provider: <BlockaidLogo />,
            }}
            values={{ riskLevel }}
          />
        )}
        high={() => (
          <Trans
            i18nKey="transaction_has_risk"
            components={{
              provider: <BlockaidLogo />,
            }}
            values={{ riskLevel }}
          />
        )}
      />
    </Container>
  )
}
