import { BlockaidLogo } from '@core/ui/chain/security/blockaid/BlockaidLogo'
import { riskLevelIcon } from '@core/ui/chain/security/blockaid/riskLevelIcon'
import { BlockaidScanning } from '@core/ui/chain/security/blockaid/scan/BlockaidScanning'
import { BlockaidScanStatusContainer } from '@core/ui/chain/security/blockaid/scan/BlockaidScanStatusContainer'
import { getRiskyTxColor } from '@core/ui/chain/security/blockaid/tx/utils/color'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'
import { SwapKitDepositRecipientScreen } from '@vultisig/core-chain/swap/general/knownAggregatorRouters'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { Trans, useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

/**
 * Blockaid's verdict on the address a SwapKit ERC-20 deposit pays, as a scan
 * status line. A warning or a missing scan is advisory and signing goes ahead;
 * a Malicious verdict is the refusal the signer raises.
 */
export const SwapKitDepositRecipientScan = ({
  value,
}: ValueProp<Query<SwapKitDepositRecipientScreen | undefined>>) => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const entity = t('swap_deposit_address')

  const renderRisk = (level: RiskLevel, detail: string) => {
    const Icon = riskLevelIcon[level]

    return (
      <Tooltip
        content={detail}
        renderOpener={props => (
          <BlockaidScanStatusContainer
            {...props}
            style={{ color: getRiskyTxColor(level, colors) }}
          >
            <Icon />
            <Trans
              i18nKey="swap_deposit_address_has_risk"
              values={{ riskLevel: t(`risk_level.${level}`) }}
              components={{ provider: <BlockaidLogo /> }}
            />
          </BlockaidScanStatusContainer>
        )}
      />
    )
  }

  const renderScreen = (screen: SwapKitDepositRecipientScreen) => {
    switch (screen.status) {
      case 'warning':
        return renderRisk('medium', screen.features.join(', '))
      case 'notScanned':
        return (
          <Tooltip
            content={screen.reason}
            renderOpener={props => (
              <BlockaidScanStatusContainer {...props}>
                <TriangleAlertIcon />
                <Trans
                  i18nKey="entity_not_scanned"
                  values={{ entity }}
                  components={{ provider: <BlockaidLogo /> }}
                />
              </BlockaidScanStatusContainer>
            )}
          />
        )
      case 'benign':
        return (
          <BlockaidScanStatusContainer>
            <CheckIcon color={colors.success.toCssValue()} />
            <Trans
              i18nKey="entity_scanned"
              values={{ entity }}
              components={{ provider: <BlockaidLogo /> }}
            />
          </BlockaidScanStatusContainer>
        )
    }
  }

  return (
    <MatchQuery
      value={value}
      success={renderScreen}
      pending={() => <BlockaidScanning />}
      error={error => renderRisk('high', extractErrorMsg(error))}
    />
  )
}
