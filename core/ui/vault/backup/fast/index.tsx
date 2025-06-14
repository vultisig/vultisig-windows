import { verifyVaultEmailCode } from '@core/mpc/fast/api/verifyVaultEmailCode'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { OTPInput } from '@lib/ui/inputs/OTPInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnFinishProp } from '@lib/ui/props'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const onCompleteDelay = 1000

export const EmailConfirmation = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { isPending, mutate, error, isSuccess } = useMutation({
    mutationFn: (code: string) =>
      verifyVaultEmailCode({
        vaultId: getVaultId(vault),
        code,
      }),
  })

  const isLargeDevice = useIsTabletDeviceAndUp()

  useEffect(() => {
    if (isSuccess) {
      const timeoutId = setTimeout(onFinish, onCompleteDelay)
      return () => clearTimeout(timeoutId)
    }
  }, [isSuccess, onFinish])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('email')}
        hasBorder
      />
      <PageContent gap={48} flexGrow scrollable>
        <VStack gap={4}>
          <Text
            variant={isLargeDevice ? 'h1Regular' : undefined}
            size={!isLargeDevice ? 24 : undefined}
          >
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
      </PageContent>
    </VStack>
  )
}

const StyledAnimatedLoader = styled(Spinner)`
  width: fit-content;
  position: relative;
  font-size: 20px;
`
