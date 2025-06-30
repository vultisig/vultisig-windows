import { verifyVaultEmailCode } from '@core/mpc/fast/api/verifyVaultEmailCode'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import {
  DigitGroupInput,
  DigitGroupInputProps,
} from '@lib/ui/inputs/DigitGroupInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnFinishProp } from '@lib/ui/props'
import { useIsTabletDeviceAndUp } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const onCompleteDelay = 1000

export const EmailConfirmation = ({ onFinish }: OnFinishProp) => {
  const [input, setInput] = useState<string | null>('')

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

  const inputState: DigitGroupInputProps['validation'] = isSuccess
    ? 'valid'
    : isPending
      ? 'loading'
      : error
        ? 'invalid'
        : 'idle'

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
          <DigitGroupInput
            value={input}
            onChange={value => setInput(value)}
            validation={inputState}
            onCompleted={value => mutate(value)}
          />
        </VStack>
      </PageContent>
    </VStack>
  )
}
