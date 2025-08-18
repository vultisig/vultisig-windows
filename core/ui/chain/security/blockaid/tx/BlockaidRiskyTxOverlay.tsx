import { RiskyTxInfo } from '@core/chain/security/blockaid/tx/validation/core'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { ValueProp } from '@lib/ui/props'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { Trans, useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useCore } from '../../../../state/core'
import { BlockaidLogo } from '../BlockaidLogo'
import { txRiskLevelIcon } from './TxRiskLevelIcon'
import { getRiskyTxColor } from './utils/color'

const DismissButton = styled(UnstyledButton)`
  ${text({
    color: 'supporting',
    size: 10,
  })}

  &:hover {
    color: ${getColor('danger')};
  }
`

export const BlockaidRiskyTxOverlay = ({ value }: ValueProp<RiskyTxInfo>) => {
  const [isDismissed, { set: dismiss }] = useBoolean(false)

  const Icon = txRiskLevelIcon[value.level]

  const { colors } = useTheme()

  const color = getRiskyTxColor(value.level, colors)

  const { t } = useTranslation()

  const { goBack } = useCore()

  if (isDismissed) return null

  return (
    <Modal
      footer={
        <VStack gap={20}>
          <Button onClick={goBack}>{t('go_back')}</Button>
          <DismissButton onClick={dismiss}>
            {t('continue_anyway')}
          </DismissButton>
        </VStack>
      }
    >
      <VStack alignItems="center" gap={24}>
        <VStack alignItems="center" gap={48}>
          <Icon fontSize={24} style={{ color }} />
          <VStack alignItems="center" gap={12}>
            <Text centerHorizontally size={22} style={{ color }}>
              {t('risky_transaction_detected', {
                riskLevel: capitalizeFirstLetter(value.level),
              })}
            </Text>
            {value.description && (
              <Text centerHorizontally size={14} color="supporting">
                {value.description}
              </Text>
            )}
          </VStack>
        </VStack>
        <Text color="supporting" centerVertically={{ gap: 4 }} size={14}>
          <Trans
            i18nKey="powered_by"
            components={{ provider: <BlockaidLogo /> }}
          />
        </Text>
      </VStack>
    </Modal>
  )
}
