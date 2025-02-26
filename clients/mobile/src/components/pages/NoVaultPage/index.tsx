import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image, View } from 'react-native'

import logo from '~/assets/images/vultisig-logo.png'
import { useExpoRouter } from '~/hooks/ui/useExpoRouter'
import { Button } from '~/lib/ui/components/Button'
import { HStack, VStack } from '~/lib/ui/components/Stack'
import { Text } from '~/lib/ui/components/Text'

import { HorizontalDecorationLine, Wrapper } from './NoVaultPage.styled'

const NoVaultPage = () => {
  const { navigate } = useExpoRouter()
  const { t } = useTranslation()

  return (
    <Wrapper>
      <VStack fullWidth flexGrow justifyContent="space-between">
        <View />
        <VStack alignItems="center" gap={8}>
          <Image source={logo} />
          <Text color="contrast" size={34} weight={500}>
            Vultisig
          </Text>
        </VStack>
        <VStack gap={16}>
          <Button onPress={() => navigate('/new-vault/create-vault')}>
            <Text size={14} color="reversed" weight={600}>
              {t('create_new_vault')}
            </Text>
          </Button>
          <HStack gap={16} alignItems="center">
            <HorizontalDecorationLine />
            <Text color="contrast" size={12} weight={600}>
              {t('or').toUpperCase()}
            </Text>
            <HorizontalDecorationLine />
          </HStack>
          <Button
            kind="secondary"
            onPress={() => navigate('/new-vault/scan-qr')}
          >
            <Text size={14} color="contrast" weight={600}>
              {t('scan_qr')}
            </Text>
          </Button>
          <Button
            kind="secondary"
            onPress={() => navigate('/new-vault/import-vault')}
          >
            <Text size={14} color="contrast" weight={600}>
              {t('import_vault')}
            </Text>
          </Button>
        </VStack>
      </VStack>
    </Wrapper>
  )
}

export default NoVaultPage
