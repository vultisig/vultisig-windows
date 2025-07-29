import { useVaultCreationMpcLib } from '@clients/desktop/src/mpc/state/vaultCreationMpcLib'
import { useCore } from '@core/ui/state/core'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Switch } from '@lib/ui/inputs/switch'
import { Modal } from '@lib/ui/modal'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ManageMpcLib = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const { version } = useCore()
  const [value, setValue] = useVaultCreationMpcLib()
  const clickCount = useRef(0)
  const isDKLS = value === 'DKLS'

  const handleClick = () => {
    if (clickCount.current < 2) {
      clickCount.current += 1
    } else {
      clickCount.current = 0

      setVisible(true)
    }
  }

  return (
    <>
      <UnstyledButton
        onClick={handleClick}
      >{`VULTISIG APP V${version}`}</UnstyledButton>
      <UnstyledButton
        onClick={handleClick}
      >{`(BUILD ${__APP_BUILD__})`}</UnstyledButton>

      {visible && (
        <Modal onClose={() => setVisible(false)} title={t('advanced')}>
          <Switch
            checked={isDKLS}
            label={t('enable_dkls')}
            onChange={() => setValue(isDKLS ? 'GG20' : 'DKLS')}
          />
        </Modal>
      )}
    </>
  )
}
