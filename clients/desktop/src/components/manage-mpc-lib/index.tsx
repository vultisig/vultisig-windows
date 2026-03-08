import { useVaultCreationMpcLib } from '@clients/desktop/src/mpc/state/vaultCreationMpcLib'
import { useCore } from '@core/ui/state/core'
import {
  useIsMLDSAEnabled,
  useSetIsMLDSAEnabledMutation,
} from '@core/ui/storage/mldsaEnabled'
import { Opener } from '@lib/ui/base/Opener'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useClickGate } from '@lib/ui/hooks/useClickGate'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const ManageMpcLib = () => {
  const { t } = useTranslation()
  const { version } = useCore()
  const [value, setValue] = useVaultCreationMpcLib()
  const gate = useClickGate()
  const isDKLS = value === 'DKLS'

  const isMLDSAEnabled = useIsMLDSAEnabled()
  const { mutate: setIsMLDSAEnabled } = useSetIsMLDSAEnabledMutation()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <UnstyledButton onClick={() => gate(onOpen)}>
          <Text
            as="span"
            color="shy"
            size={12}
          >{`${t('version')} ${version}`}</Text>
        </UnstyledButton>
      )}
      renderContent={({ onClose }) => (
        <Modal onClose={onClose} title={t('advanced')}>
          <VStack gap={16}>
            <Switch
              checked={isDKLS}
              label={t('enable_dkls')}
              onChange={() => setValue(isDKLS ? 'GG20' : 'DKLS')}
            />
            <Switch
              checked={isMLDSAEnabled}
              label={t('enable_mldsa')}
              onChange={() => setIsMLDSAEnabled(!isMLDSAEnabled)}
            />
          </VStack>
        </Modal>
      )}
    />
  )
}
