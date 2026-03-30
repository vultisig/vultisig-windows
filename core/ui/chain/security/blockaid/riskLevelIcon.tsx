import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { SvgProps } from '@lib/ui/props'
import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'

export const riskLevelIcon: Record<RiskLevel, React.FC<SvgProps>> = {
  medium: CircleAlertIcon,
  high: TriangleAlertIcon,
}
