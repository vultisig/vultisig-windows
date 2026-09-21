import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { Trans, useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { BlockaidLogo } from '../BlockaidLogo'
import { BlockaidOverlay } from '../BlockaidOverlay'
import { riskLevelIcon } from '../riskLevelIcon'
import { BlockaidScanStatusContainer } from '../scan/BlockaidScanStatusContainer'
import { getBlockaidScanEntityName } from '../utils/entity'
import { BlockaidTxScanResult } from './queries/blockaidTxValidation'
import { getRiskyTxColor } from './utils/color'

type BlockaidTxValidationResultProps = ValueProp<BlockaidTxScanResult> & {
  /**
   * Whether a flagged transaction also raises the blocking overlay. Screens
   * that present the verdict in their own surface (the review sheet) render
   * the status line alone.
   */
  withOverlay?: boolean
}

/**
 * The scan's status line: the verdict with the Blockaid mark, and — unless the
 * caller shows the verdict itself — the blocking overlay for a flagged tx.
 */
export const BlockaidTxValidationResult = ({
  value,
  withOverlay = true,
}: BlockaidTxValidationResultProps) => {
  const { colors } = useTheme()

  const { t } = useTranslation()

  if (value) {
    const Icon = riskLevelIcon[value.level]

    const color = getRiskyTxColor(value.level, colors)

    const warning = value.description ?? t('risky_tx_warning')

    return (
      <>
        {withOverlay && (
          <BlockaidOverlay
            riskLevel={value.level}
            description={warning}
            title={t('risky_transaction_detected', {
              riskLevel: t(`risk_level.${value.level}`),
            })}
          />
        )}
        <Tooltip
          content={warning}
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
                values={{ riskLevel: t(`risk_level.${value.level}`) }}
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
