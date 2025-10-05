import { useVaultCreationMpcLib } from '@clients/desktop/src/mpc/state/vaultCreationMpcLib'
import { useCore } from '@core/ui/state/core'
import { Opener } from '@lib/ui/base/Opener'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Switch } from '@lib/ui/inputs/switch'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

export const ManageMpcLib = () => {
  const { t } = useTranslation()
  const { version } = useCore()
  const [value, setValue] = useVaultCreationMpcLib()
  const clickCount = useRef(0)
  const isDKLS = value === 'DKLS'

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <UnstyledButton
          onClick={() => {
            if (clickCount.current < 2) {
              clickCount.current += 1
              return
            }

            onOpen()
            clickCount.current = 0
          }}
        >
          <Text
            as="span"
            color="shy"
            size={12}
          >{`${t('version')} ${version}`}</Text>
        </UnstyledButton>
      )}
      renderContent={({ onClose }) => (
        <Modal onClose={onClose} title={t('advanced')}>
          <Switch
            checked={isDKLS}
            label={t('enable_dkls')}
            onChange={() => setValue(isDKLS ? 'GG20' : 'DKLS')}
          />
        </Modal>
      )}
    />
  )
}
