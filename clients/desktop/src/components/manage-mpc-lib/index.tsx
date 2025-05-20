import { useVaultCreationMpcLib } from '@clients/desktop/src/mpc/state/vaultCreationMpcLib'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Switch } from '@lib/ui/inputs/switchControlContainer'
import { Modal } from '@lib/ui/modal'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ManageMpcLib = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useVaultCreationMpcLib()
  const clickCount = useRef(0)

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
          <Switch
            value={value === 'DKLS'}
            onChange={() => setValue(value === 'DKLS' ? 'GG20' : 'DKLS')}
            label={t('enable_dkls')}
          />
        </Modal>
      )}
    </>
  )
}
