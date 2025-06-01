import { Button } from '@lib/ui/buttons/Button'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { UnlockIcon } from '@lib/ui/icons/UnlockIcon'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { usePasscodeEncryption } from '../../storage/passcodeEncryption'
import { decryptSample } from '../core/sample'
import { PasscodeInput } from '../manage/PasscodeInput'
import { usePasscode } from '../state/passcode'

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

  const isDisabled = useMemo(() => {
    if (!inputValue) {
      return t('enter_passcode')
    }

    const { encryptedSample } = shouldBePresent(passcodeEncryption)
    const decryptedSampleResult = attempt(() =>
      decryptSample({
        key: inputValue,
        value: encryptedSample,
      })
    )

    if ('error' in decryptedSampleResult) {
      return t('invalid_passcode')
    }

    return false
  }, [inputValue, passcodeEncryption, t])

  const handleSubmit = useCallback(() => {
    setPasscode(inputValue)
  }, [inputValue, setPasscode])

  useEffect(() => {
    if (inputValue && !isDisabled) {
      handleSubmit()
    }
  }, [inputValue, isDisabled, handleSubmit])

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
        <Content
          as="form"
          {...getFormProps({
            isDisabled,
            onSubmit: handleSubmit,
          })}
        >
          <PasscodeInput onChange={setInputValue} />
          <Button type="submit" isDisabled={isDisabled}>
            <HStack alignItems="center" gap={8}>
              <UnlockIcon fontSize={20} />
              <Text>{t('unlock')}</Text>
            </HStack>
          </Button>
        </Content>
      </Container>
    </Wrapper>
  )
}
