import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

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
  position: relative;
  overflow: hidden;
  background: ${getColor('background')};
`

// The design's backdrop: a blurred 648px glow and a faint 590px ring sharing
// a centre 20px right of and 50px below the frame's centre.
const glowDiameter = 648
const ringDiameter = 590.8

const backdropCircle = css`
  position: absolute;
  left: calc(50% + 20px);
  top: calc(50% + 50px);
  transform: translate(-50%, -50%);
  ${borderRadius.pill};
  pointer-events: none;
`

const Glow = styled.div`
  ${backdropCircle};
  width: ${glowDiameter}px;
  height: ${glowDiameter}px;
  background: ${({ theme }) => `radial-gradient(
    circle,
    ${theme.colors.primaryAccentTwo.getVariant({ a: () => 0.57 }).toCssValue()} 0%,
    ${theme.colors.background.getVariant({ a: () => 0.41 }).toCssValue()} 100%
  )`};
  opacity: 0.5;
  filter: blur(4.4px);
`

const Ring = styled.div`
  ${backdropCircle};
  width: ${ringDiameter}px;
  height: ${ringDiameter}px;
  border: 0.7px solid
    ${({ theme }) =>
      theme.colors.primary.getVariant({ a: () => 0.05 }).toCssValue()};
`

const Container = styled.div`
  ${takeWholeSpace};
  position: relative;
  padding: 0 16px;

  ${vStack({
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  })}
`

// The design's 360px frame minus its 16px side margins.
const panelMaxWidth = 328

const Content = styled.div`
  width: 100%;
  max-width: ${panelMaxWidth}px;
  padding: 16px;
  ${borderRadius.xl};
  background: ${({ theme }) =>
    theme.colors.foregroundSuper.getVariant({ a: () => 0.1 }).toCssValue()};
  border: 1px solid
    ${({ theme }) =>
      theme.colors.contrast.getVariant({ a: () => 0.1 }).toCssValue()};
  ${vStack({
    alignItems: 'center',
    gap: 24,
  })}
`

/**
 * The App Locked screen. Verifies the entered passcode once it reaches the
 * stored length, throttles repeated failures, and unlocks the app on success.
 */
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
      <Glow />
      <Ring />
      <Container>
        {/* 15 lands the subtitle baseline 37px under the title's, as designed */}
        <VStack alignItems="center" gap={15}>
          <Text
            size={34}
            weight={500}
            letterSpacing={-1}
            color="regular"
            centerHorizontally
          >
            {t('app_locked')}
          </Text>
          <Text variant="footnote" color="shy" centerHorizontally>
            {t('app_locked_description')}
          </Text>
        </VStack>
        <Content>
          <PasscodeInput
            appearance="dots"
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
