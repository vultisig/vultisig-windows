import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { HStack } from '@lib/ui/layout/Stack'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  useCurrentVault,
  useVaultServerStatus,
} from '../../vault/state/currentVault'

const Tag = styled.div`
  height: 22px;
  ${centerContent};
  ${horizontalPadding(6)};
  ${borderRadius.xs};
  background: ${getColor('foregroundSuper')};
  ${text({
    color: 'supporting',
    weight: 700,
    size: 14,
    nowrap: true,
  })}
`

export const VaultSigningInfo = () => {
  const { hasServer, isBackup } = useVaultServerStatus()
  const { signers, local_party_id } = useCurrentVault()

  const { t } = useTranslation()

  const index = signers.indexOf(local_party_id)

  return (
    <HStack alignItems="center" gap={8}>
      {index >= 0 && (
        <Text nowrap size={14} weight={'700'} color="supporting">
          {t('share_n_of_m', { n: index + 1, m: signers.length })}
        </Text>
      )}
      {hasServer && !isBackup && <Tag>{t('fast_sign')}</Tag>}
    </HStack>
  )
}
