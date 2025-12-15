import { RiskLevel } from '@core/chain/security/blockaid/core/riskLevel'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { TitleProp } from '@lib/ui/props'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Trans, useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useCore } from '../../../state/core'
import { BlockaidLogo } from './BlockaidLogo'
import { riskLevelIcon } from './riskLevelIcon'
import { getRiskyTxColor } from './tx/utils/color'

const DismissButton = styled(UnstyledButton)`
  ${text({
    color: 'supporting',
    size: 10,
  })}

  &:hover {
    color: ${getColor('danger')};
  }
`

type BlockaidOverlayProps = TitleProp & {
  riskLevel: RiskLevel
  description?: string
}

export const BlockaidOverlay = ({
  riskLevel,
  description,
  title,
}: BlockaidOverlayProps) => {
  const [isDismissed, { set: dismiss }] = useBoolean(false)

  const Icon = riskLevelIcon[riskLevel]

  const { colors } = useTheme()

  const color = getRiskyTxColor(riskLevel, colors)

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
              {title}
            </Text>
            {description && (
              <Text centerHorizontally size={14} color="supporting">
                {description}
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
