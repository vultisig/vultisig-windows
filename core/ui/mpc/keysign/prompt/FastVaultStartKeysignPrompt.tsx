import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { Milliseconds } from '@lib/utils/time'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { VaultSecurityType } from '../../../vault/VaultSecurityType'
import { StartKeysignPromptProps } from './StartKeysignPromptProps'

const clickDurationThreshold: Milliseconds = 300
const registerPressDelay: Milliseconds = 200
const requiredPressDuration: Milliseconds = 1600

const Container = styled(Button)`
  position: relative;
  overflow: hidden;
`

const Fill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  pointer-events: none;
  background: ${getColor('mistExtra')};
  width: 0%;
  animation: fillProgress ${requiredPressDuration - registerPressDelay}ms linear
    ${registerPressDelay}ms forwards;

  @keyframes fillProgress {
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  }
`

export const FastVaultStartKeysignPrompt = (props: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [startPressingAt, setStartPressingAt] = useState<null | number>(null)

  const keysignPayload =
    'keysignPayload' in props ? props.keysignPayload : undefined

  const executeNavigation = useCallback(
    (securityType: VaultSecurityType) => {
      navigate({
        id: 'keysign',
        state: {
          ...props,
          keysignPayload: shouldBePresent(keysignPayload),
          securityType,
        },
      })
    },
    [props, keysignPayload, navigate]
  )

  useEffect(() => {
    if (!startPressingAt) return

    const interval = setTimeout(() => {
      executeNavigation('secure')
    }, requiredPressDuration)

    return () => clearTimeout(interval)
  }, [executeNavigation, startPressingAt])

  const buttonProps = useMemo(() => {
    if (!keysignPayload) {
      return {
        disabled: 'disabledMessage' in props ? props.disabledMessage : true,
      }
    }

    return {
      onPointerDown: () => {
        setStartPressingAt(Date.now())
      },
      onPointerUp: () => {
        if (!startPressingAt) return

        const durationSincePress = Date.now() - startPressingAt

        if (durationSincePress < clickDurationThreshold) {
          executeNavigation('fast')
        } else {
          setStartPressingAt(null)
        }
      },
      onPointerLeave: () => {
        setStartPressingAt(null)
      },
    }
  }, [executeNavigation, startPressingAt, keysignPayload, props])

  return (
    <VStack gap={12}>
      <Text
        size={14}
        color="shy"
        style={{ textAlign: 'center', width: '100%' }}
      >
        {t('hold_for_paired_sign')}
      </Text>
      <Container {...buttonProps}>
        {t('fast_sign')}
        {startPressingAt && <Fill />}
      </Container>
    </VStack>
  )
}
