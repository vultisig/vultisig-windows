import { Button } from '@lib/ui/buttons/Button'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnBackProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { PageContent } from '../../../ui/page/PageContent'

export const FailedSetupVaultKeygenStep: FC<OnBackProp> = ({ onBack }) => {
  const { t } = useTranslation()

  return (
    <PageContent alignItems="center" gap={24}>
      <VStack flexGrow gap={32}>
        <VStack flexGrow justifyContent="center" gap={32}>
          <VStack gap={12}>
            <Text centerHorizontally color="danger" size={22} weight={500}>
              {t('serverTimedOut')}
            </Text>
            <Text centerHorizontally color="shy" size={14} weight={500}>
              {t('took_too_long_to_respond')}
            </Text>
          </VStack>
          <TryAgainBtn kind="secondary" onClick={onBack}>
            {t('try_again')}
          </TryAgainBtn>
        </VStack>
        <ErrorInfoBoxWrapper alignItems="center" gap={8}>
          <TriangleAlertIcon />
          <Text size={14} weight={500} color="danger">
            {t('timeout_error')}
          </Text>
        </ErrorInfoBoxWrapper>
      </VStack>
    </PageContent>
  )
}

const TryAgainBtn = styled(Button)`
  align-self: center;
`

const ErrorInfoBoxWrapper = styled(HStack)`
  width: 100%;
  padding: 24px 36px;
  border: 1px solid ${getColor('danger')};
  border-radius: 24px;
  background-color: #2b1111;
  color: ${getColor('danger')};
`
