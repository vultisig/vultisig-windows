import { Button } from '@lib/ui/buttons/Button'
import { TabletSmartphoneIcon } from '@lib/ui/icons/TabletSmartphoneIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { VaultSecurityType } from '../../../vault/VaultSecurityType'
import {
  FastVaultPasswordModal,
  FastVaultPasswordModalResult,
} from '../../fast/FastVaultPasswordModal'
import { StartKeysignPromptProps } from './StartKeysignPromptProps'

const FastSignButton = styled(Button)`
  flex: 1;
  min-width: 0;
`

const PairedButton = styled(Button)`
  flex: 0 0 132px;
`

export const FastVaultStartKeysignPrompt = (props: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [showModal, setShowModal] = useState(false)

  const keysignPayload =
    'keysignPayload' in props ? props.keysignPayload : undefined

  const executeNavigation = useCallback(
    (securityType: VaultSecurityType) => {
      if (securityType === 'fast') {
        setShowModal(true)
        return
      } else {
        navigate({
          id: 'keysign',
          state: {
            ...props,
            keysignPayload: shouldBePresent(keysignPayload),
            securityType,
          },
        })
      }
    },
    [props, keysignPayload, navigate]
  )

  const onGetPassword = useCallback(
    ({ password }: FastVaultPasswordModalResult) => {
      navigate({
        id: 'keysign',
        state: {
          ...props,
          keysignPayload: shouldBePresent(keysignPayload),
          securityType: 'fast',
          password,
        },
      })
    },
    [props, keysignPayload, navigate]
  )

  const buttonProps = useMemo(() => {
    if (!keysignPayload) {
      return {
        disabled: 'disabledMessage' in props ? props.disabledMessage : true,
      }
    }

    return {
      disabled: false,
    }
  }, [keysignPayload, props])

  return (
    <>
      <HStack gap={12} fullWidth>
        <FastSignButton
          {...buttonProps}
          onClick={() => executeNavigation('fast')}
        >
          {t('fast_sign')}
        </FastSignButton>
        <PairedButton
          {...buttonProps}
          kind="secondary"
          icon={<TabletSmartphoneIcon />}
          onClick={() => executeNavigation('secure')}
        >
          {t('paired')}
        </PairedButton>
      </HStack>
      <FastVaultPasswordModal
        showModal={showModal}
        onBack={() => setShowModal(false)}
        onFinish={onGetPassword}
        description={t('fast_vault_password_start_keysign_description')}
        withPasswordCache
      />
    </>
  )
}
