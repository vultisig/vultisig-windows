import {
  VaultKeyGroup,
  vaultKeyGroupLabel,
} from '@core/chain/signing/VaultKeyGroup'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const HeaderContainer = styled(HStack)`
  background: ${getColor('foreground')};
  padding: 8px 12px;
  ${borderRadius.s}
`

type AlgorithmSectionHeaderProps = {
  group: VaultKeyGroup
  hasKeys: boolean
}

export const AlgorithmSectionHeader = ({
  group,
  hasKeys,
}: AlgorithmSectionHeaderProps) => {
  const { t } = useTranslation()

  return (
    <HeaderContainer gap={8} alignItems="center">
      <Text size={17} weight={600} color="contrast">
        {vaultKeyGroupLabel[group]}
      </Text>
      {hasKeys && (
        <HStack gap={4} alignItems="center">
          <IconWrapper style={{ color: '#4fae6e' }} size={16}>
            <CheckIcon />
          </IconWrapper>
          <Text size={13} weight={500} color="shy">
            {t('key_generated')}
          </Text>
        </HStack>
      )}
    </HeaderContainer>
  )
}
