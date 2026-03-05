import { verifyVaultEmailCode } from '@core/mpc/fast/api/verifyVaultEmailCode'
import { getVaultId } from '@core/mpc/vault/Vault'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { EmailNotificationIcon } from '@lib/ui/icons/EmailNotificationIcon'
import {
  MultiCharacterInput,
  MultiCharacterInputProps,
} from '@lib/ui/inputs/MultiCharacterInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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

  const inputState: MultiCharacterInputProps['validation'] = (() => {
    if (isSuccess) return 'valid'
    if (isPending) return 'loading'
    if (error) return 'invalid'
    return 'idle'
  })()

  const showEmailSection = !isPending

  return (
    <VStack fullHeight>
      <PageHeader primaryControls={<PageHeaderBackButton onClick={onBack} />} />
      <PageContent flexGrow scrollable>
        <CenteredContent gap={24}>
          <VStack gap={8} alignItems="center">
            <IconWrapper>
              <EmailNotificationIcon style={{ fontSize: 20 }} />
            </IconWrapper>
            <Text
              size={22}
              weight={500}
              color="contrast"
              style={{ textAlign: 'center' }}
            >
              {t('fastVaultSetup.backup.enterCode')}
            </Text>
            <Text size={14} color="shy" style={{ textAlign: 'center' }}>
              {t('fastVaultSetup.backup.codeInfo')}
            </Text>
          </VStack>
          <VStack gap={50} alignItems="center">
            <MultiCharacterInput
              value={input}
              onChange={value => {
                setInput(value)
                reset()
              }}
              validation={inputState}
              length={emailConfirmationCodeLength}
            />
            {showEmailSection && (
              <VStack gap={4} alignItems="center">
                <Text size={12} color="shy">
                  {t('fastVaultSetup.backup.sentTo', { email })}
                </Text>
                {onChangeEmailAndRestart && (
                  <UnstyledButton onClick={onChangeEmailAndRestart}>
                    <Text size={13} color="shyExtra">
                      {t('fastVaultSetup.backup.changeEmailAndRestartKeygen')}
                    </Text>
                  </UnstyledButton>
                )}
              </VStack>
            )}
          </VStack>
        </CenteredContent>
      </PageContent>
    </VStack>
  )
}

const IconWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25) inset;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 8px;
    background: radial-gradient(
      ellipse at center,
      rgba(37, 97, 255, 0.4) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }
`

const CenteredContent = styled(VStack)`
  align-items: center;
  padding-top: 40px;
`
