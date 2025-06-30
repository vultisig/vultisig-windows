import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Milliseconds } from '@lib/utils/time'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { VaultSecurityType } from '../../../vault/VaultSecurityType'
import { StartKeysignPromptProps } from './StartKeysignPromptProps'

const clickDurationThreshold: Milliseconds = 300
const registerPressDelay: Milliseconds = 200
const requiredPressDuration: Milliseconds = 1500

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
  animation: fillProgress ${requiredPressDuration}ms linear
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

export const FastVaultStartKeysignPrompt = ({
  isDisabled,
  ...coreViewState
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [startPressingAt, setStartPressingAt] = useState<null | number>(null)

  const executeNavigation = useCallback(
    (securityType: VaultSecurityType) => {
      navigate({
        id: 'keysign',
        state: {
          securityType,
          ...coreViewState,
        },
      })
    },
    [coreViewState, navigate]
  )

  useEffect(() => {
    if (!startPressingAt) return

    const interval = setInterval(() => {
      executeNavigation('secure')
    }, requiredPressDuration)

    return () => clearInterval(interval)
  }, [executeNavigation, startPressingAt])

  return (
    <VStack gap={12}>
      <Text
        size={14}
        color="shy"
        style={{ textAlign: 'center', width: '100%' }}
      >
        {t('hold_for_paired_sign')}
      </Text>
      <Container
        disabled={isDisabled}
        onPointerDown={() => {
          if (isDisabled) return

          setStartPressingAt(Date.now())
        }}
        onPointerUp={() => {
          if (isDisabled) return

          if (!startPressingAt) return

          const durationSincePress = Date.now() - startPressingAt

          if (durationSincePress < clickDurationThreshold) {
            executeNavigation('fast')
          } else {
            setStartPressingAt(null)
          }
        }}
        onPointerLeave={() => {
          setStartPressingAt(null)
        }}
      >
        {t('fast_sign')}
        {startPressingAt && <Fill />}
      </Container>
    </VStack>
  )
}
