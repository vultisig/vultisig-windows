import { TxRiskLevel } from '@core/chain/security/blockaid/tx/validation/core'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { SvgProps } from '@lib/ui/props'

export const txRiskLevelIcon: Record<TxRiskLevel, React.FC<SvgProps>> = {
  medium: CircleAlertIcon,
  high: TriangleAlertIcon,
}
