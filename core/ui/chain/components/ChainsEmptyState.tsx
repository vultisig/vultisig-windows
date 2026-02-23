import { Button } from '@lib/ui/buttons/Button'
import { CryptoWalletPenIcon } from '@lib/ui/icons/CryptoWalletPenIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ChainsEmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  onCustomize: () => void
}

export const ChainsEmptyState = ({
  icon,
  title,
  description,
  onCustomize,
}: ChainsEmptyStateProps) => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <VStack gap={12} alignItems="center">
        {icon}
        <VStack gap={8}>
          <Text centerHorizontally size={17} weight="600">
            {title}
          </Text>
          <Text centerHorizontally size={13} color="shy">
            {description}
          </Text>
        </VStack>
      </VStack>
      <Button
        onClick={onCustomize}
        style={{ maxWidth: 'fit-content', maxHeight: 32 }}
        icon={
          <IconWrapper size={16}>
            <CryptoWalletPenIcon />
          </IconWrapper>
        }
      >
        <Text size={12}>{t('customize_chains')}</Text>
      </Button>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${vStack({
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  })};
  padding: 32px 40px;
  border-radius: 16px;
  background: ${getColor('foreground')};
`
