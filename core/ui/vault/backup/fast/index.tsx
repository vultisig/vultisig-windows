import { verifyVaultEmailCode } from '@core/mpc/fast/api/verifyVaultEmailCode'
import { getVaultId } from '@core/mpc/vault/Vault'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import {
  MultiCharacterInput,
  MultiCharacterInputProps,
} from '@lib/ui/inputs/MultiCharacterInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const onCompleteDelay = 1000
const emailConfirmationCodeLength = 4

type EmailConfirmationProps = OnFinishProp &
  OnBackProp & {
    email: string
    onChangeEmailAndRestart?: () => void
  }

export const EmailConfirmation = ({
  onFinish,
  onBack,
  email,
  onChangeEmailAndRestart,
}: EmailConfirmationProps) => {
  const [input, setInput] = useState<string | null>('')

  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { isPending, mutate, error, isSuccess, reset } = useMutation({
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

  useEffect(() => {
    if (
      input?.length === emailConfirmationCodeLength &&
      !isPending &&
      !isSuccess &&
      !error
    ) {
      mutate(input)
    }
  }, [error, input, isPending, isSuccess, mutate])

  const inputState = useMemo<MultiCharacterInputProps['validation']>(() => {
    if (isSuccess) return 'valid'
    if (isPending) return 'loading'
    if (error) return 'invalid'
    return 'idle'
  }, [isSuccess, isPending, error])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
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
        <VStack gap={8}>
          <MultiCharacterInput
            value={input}
            onChange={value => {
              setInput(value)
              reset()
            }}
            validation={inputState}
            length={emailConfirmationCodeLength}
          />
          <VStack gap={4}>
            <Text size={12} color="shy">
              {t('fastVaultSetup.backup.sentTo', { email })}
            </Text>
            {onChangeEmailAndRestart && (
              <UnstyledButton onClick={onChangeEmailAndRestart}>
                <Text
                  style={{
                    textAlign: 'left',
                  }}
                  size={13}
                  color="shyExtra"
                >
                  {t('fastVaultSetup.backup.changeEmailAndRestartKeygen')}
                </Text>
              </UnstyledButton>
            )}
          </VStack>
        </VStack>
      </PageContent>
    </VStack>
  )
}
