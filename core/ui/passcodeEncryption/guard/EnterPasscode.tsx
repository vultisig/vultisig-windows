import { passcodeEncryptionConfig } from '@core/ui/passcodeEncryption/core/config'
import { decryptSample } from '@core/ui/passcodeEncryption/core/sample'
import { PasscodeInput } from '@core/ui/passcodeEncryption/manage/PasscodeInput'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { usePasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Wrapper = styled.div`
  ${takeWholeSpace}
  background: ${getColor('background')};
`

const Container = styled.div`
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(4, 57, 199, 0.57) 0%,
    rgba(2, 18, 42, 0.41) 100%
  );

  ${takeWholeSpace};

  ${vStack({
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  })}
`

const Content = styled.div`
  ${panel()}
  padding: 26px;
  ${vStack({
    gap: 24,
  })}
  background: ${({ theme }) =>
    theme.colors.foregroundSuper.getVariant({ a: () => 0.1 }).toCssValue()};
  border: 1px solid ${getColor('mistExtra')};
`

export const EnterPasscode = () => {
  const { t } = useTranslation()

  const passcodeEncryption = usePasscodeEncryption()

  const [inputValue, setInputValue] = useState<string | null>(null)
  const [, setPasscode] = usePasscode()
  const [isInvalid, setIsInvalid] = useState(false)

  const isComplete =
    !!inputValue &&
    inputValue.length === passcodeEncryptionConfig.passcodeLength

  // Validate only once the full passcode is entered, and asynchronously:
  // decryptSample runs the PBKDF2 key derivation, so validating synchronously on
  // every keystroke would block the UI. On success the passcode unlocks the app.
  useEffect(() => {
    if (!isComplete) {
      setIsInvalid(false)
      return
    }

    const { encryptedSample } = shouldBePresent(passcodeEncryption)
    let cancelled = false

    decryptSample({ key: inputValue, value: encryptedSample })
      .then(() => {
        if (!cancelled) {
          setIsInvalid(false)
          setPasscode(inputValue)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsInvalid(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isComplete, inputValue, passcodeEncryption, setPasscode])

  return (
    <Wrapper>
      <Container>
        <VStack alignItems="center" gap={16}>
          <Text size={34} color="contrast">
            {t('app_locked')}
          </Text>
          <Text size={13} color="supporting">
            {t('app_locked_description')}
          </Text>
        </VStack>
        <Content>
          <PasscodeInput
            onChange={setInputValue}
            validation={isInvalid ? 'invalid' : undefined}
            validationMessages={
              isInvalid ? { invalid: t('invalid_passcode') } : undefined
            }
            value={inputValue}
            autoFocus
          />
        </Content>
      </Container>
    </Wrapper>
  )
}
