import { Button } from '@lib/ui/buttons/Button'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../state/core'
import { usePasscodeEncryption } from '../../storage/passcodeEncryption'
import { StorageKey } from '../../storage/StorageKey'
import { passcodeEncryptionConfig } from '../core/config'
import {
  getPasscodeAttemptDelayMs,
  recordFailedPasscodeAttempt,
  withPasscodeOperationLock,
} from '../core/passcodeAttemptThrottle'
import {
  getPasscodeEntryLength,
  isPasscodeEntryCandidate,
  verifyPasscodeEntry,
} from '../core/passcodeLock'
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
  const { i18n, t } = useTranslation()
  const { getPasscodeEncryption, getVaults, setPasscodeEncryption } = useCore()
  const refetchQueries = useRefetchQueries()

  const passcodeEncryption = usePasscodeEncryption()
  const [inputValue, setInputValue] = useState<string | null>(null)
  const [, setPasscode] = usePasscode()
  const [isInvalid, setIsInvalid] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [legacyRecoverySubmission, setLegacyRecoverySubmission] = useState<
    string | null
  >(null)
  const [attemptState, setAttemptState] = useState(
    passcodeEncryption?.attemptState
  )
  const [now, setNow] = useState(Date.now)

  const encryptedSample = passcodeEncryption?.encryptedSample ?? null
  const passcodeLength = getPasscodeEntryLength({
    encryptedSample,
    storedPasscodeLength: passcodeEncryption?.passcodeLength,
  })
  const retryDelayMs = getPasscodeAttemptDelayMs({ state: attemptState, now })
  const isLockedOut = retryDelayMs > 0

  const isComplete =
    !!inputValue &&
    (legacyRecoverySubmission === inputValue ||
      isPasscodeEntryCandidate({
        encryptedSample,
        passcode: inputValue,
        storedPasscodeLength: passcodeEncryption?.passcodeLength,
      }))

  useEffect(() => {
    setAttemptState(passcodeEncryption?.attemptState)
  }, [passcodeEncryption?.attemptState])

  useEffect(() => {
    if (!isLockedOut) {
      return
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1_000)

    return () => window.clearInterval(interval)
  }, [isLockedOut])

  // Validate only once the full passcode is entered, and asynchronously:
  // verifyPasscode runs the PBKDF2 key derivation, so validating synchronously
  // on every keystroke would block the UI. On success the passcode unlocks the
  // app.
  useEffect(() => {
    if (!isComplete || isLockedOut) {
      return
    }

    let cancelled = false

    const verifyEnteredPasscode = async () => {
      setIsVerifying(true)

      await withPasscodeOperationLock(async () => {
        const [current, currentVaults] = await Promise.all([
          getPasscodeEncryption(),
          getVaults(),
        ])
        const activeAttemptState =
          (attemptState?.failedAttempts ?? 0) >
          (current?.attemptState?.failedAttempts ?? 0)
            ? attemptState
            : current?.attemptState
        const currentDelay = getPasscodeAttemptDelayMs({
          state: activeAttemptState,
          now: Date.now(),
        })

        if (currentDelay > 0) {
          if (!cancelled) {
            setAttemptState(activeAttemptState)
            setInputValue(null)
            setNow(Date.now())
          }
          return
        }

        const verification = await verifyPasscodeEntry({
          allowProoflessLegacy: legacyRecoverySubmission === inputValue,
          vaults: currentVaults,
          encryptedSample: current?.encryptedSample ?? null,
          passcode: inputValue,
          storedPasscodeLength: current?.passcodeLength,
        })

        if (verification === 'incomplete') {
          return
        }

        if (verification === 'invalid') {
          const nextAttemptState = recordFailedPasscodeAttempt({
            state: activeAttemptState,
            now: Date.now(),
          })

          await setPasscodeEncryption({
            ...current,
            encryptedSample: current?.encryptedSample ?? null,
            attemptState: nextAttemptState,
          })
          await refetchQueries([StorageKey.passcodeEncryption])

          if (!cancelled) {
            setAttemptState(nextAttemptState)
            setInputValue(null)
            setIsInvalid(true)
            setNow(Date.now())
          }
          return
        }

        if (current?.attemptState) {
          const cleared = { ...current }
          delete cleared.attemptState
          await setPasscodeEncryption(
            cleared.encryptedSample === null ? null : cleared
          )
          await refetchQueries([StorageKey.passcodeEncryption])
        }

        if (!cancelled) {
          setIsInvalid(false)
          setPasscode(inputValue)
        }
      })
    }

    verifyEnteredPasscode()
      .catch(() => {
        if (!cancelled) {
          setInputValue(null)
          setIsInvalid(true)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsVerifying(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    attemptState,
    getPasscodeEncryption,
    getVaults,
    inputValue,
    isComplete,
    isLockedOut,
    legacyRecoverySubmission,
    refetchQueries,
    setPasscode,
    setPasscodeEncryption,
  ])

  const validation =
    isVerifying || isLockedOut ? 'loading' : isInvalid ? 'invalid' : undefined
  const retrySeconds = Math.ceil(retryDelayMs / 1_000)
  const retryTime = new Intl.RelativeTimeFormat(
    i18n.resolvedLanguage ?? i18n.language,
    { numeric: 'always' }
  ).format(retrySeconds, 'second')

  const validationMessages = isLockedOut
    ? {
        loading: `${t('try_again')} ${retryTime}`,
      }
    : isInvalid
      ? { invalid: t('invalid_passcode') }
      : undefined

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
            length={passcodeLength}
            onChange={value => {
              setInputValue(value)
              setLegacyRecoverySubmission(null)
              setIsInvalid(false)
            }}
            validation={validation}
            validationMessages={validationMessages}
            value={inputValue}
            autoFocus
          />
          {encryptedSample === null &&
            inputValue?.length ===
              passcodeEncryptionConfig.legacyPasscodeLength && (
              <Button
                disabled={isVerifying || isLockedOut}
                onClick={() => setLegacyRecoverySubmission(inputValue)}
              >
                {t('continue')}
              </Button>
            )}
        </Content>
      </Container>
    </Wrapper>
  )
}
