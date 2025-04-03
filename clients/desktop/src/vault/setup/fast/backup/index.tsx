import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { OTPInput } from '../../../../lib/ui/inputs/OTPInput'
import { Spinner } from '../../../../lib/ui/loaders/Spinner'
import { FlowPageHeader } from '../../../../ui/flow/FlowPageHeader'
import { PageContent } from '../../../../ui/page/PageContent'
import { verifyVaultEmailCode } from '../../../fast/api/verifyVaultEmailCode'
import { useCurrentVault } from '../../../state/currentVault'
import { getStorageVaultId } from '../../../utils/storageVault'

const ON_COMPLETE_DELAY = 1000

export const EmailConfirmation = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { isPending, mutate, error, isSuccess } = useMutation({
    mutationFn: (code: string) =>
      verifyVaultEmailCode({
        vaultId: getStorageVaultId(vault),
        code,
      }),
  })

  useEffect(() => {
    if (isSuccess) {
      const timeoutId = setTimeout(onFinish, ON_COMPLETE_DELAY)
      return () => clearTimeout(timeoutId)
    }
  }, [isSuccess, onFinish])

  return (
    <>
      <FlowPageHeader title={t('email')} />
      <PageContent>
        <VStack flexGrow gap={48}>
          <VStack gap={4}>
            <Text variant="h1Regular">
              {t('fastVaultSetup.backup.enterCode')}
            </Text>
            <Text size={14} color="shy">
              {t('fastVaultSetup.backup.codeInfo')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <OTPInput
              validation={error ? 'invalid' : isSuccess ? 'valid' : undefined}
              onCompleted={value => mutate(value)}
            />
            {error ? (
              <Text size={13} color="danger">
                {t('email_confirmation_code_error')}
              </Text>
            ) : (
              isPending && (
                <HStack gap={4}>
                  <StyledAnimatedLoader />
                  <Text weight={500} as="span" color="contrast" size={13}>
                    {t('fastVaultSetup.backup.verifyingCode')}
                  </Text>
                </HStack>
              )
            )}
          </VStack>
        </VStack>
      </PageContent>
    </>
  )
}

const StyledAnimatedLoader = styled(Spinner)`
  width: fit-content;
  position: relative;
  font-size: 20px;
`
