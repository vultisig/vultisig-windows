import { useVaultCreationMpcLib } from '@clients/desktop/src/mpc/state/vaultCreationMpcLib'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Switch } from '@lib/ui/inputs/switch'
import { HStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ManageMpcLib = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useVaultCreationMpcLib()
  const clickCount = useRef(0)
  const isDKLS = value === 'DKLS'

  const handleClick = () => {
    if (clickCount.current < 5) {
      clickCount.current += 1
    } else {
      clickCount.current = 0

      setVisible(true)
    }
  }

  return (
    <>
      <UnstyledButton onClick={handleClick}>
        (BUILD {__APP_BUILD__})
      </UnstyledButton>

      {visible && (
        <Modal
          onClose={() => setVisible(false)}
          placement="center"
          title={t('advanced')}
          width={368}
        >
          <HStack gap={8}>
            <Switch
              checked={isDKLS}
              onChange={() => setValue(isDKLS ? 'GG20' : 'DKLS')}
            />
            <Text size={16}>{t('enable_dkls')}</Text>
          </HStack>
        </Modal>
      )}
    </>
  )
}
