import { VultDiscountTier } from '@core/chain/swap/affiliate/config'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { Modal } from '@lib/ui/modal'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const UnlockDiscountTier = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Button onClick={onOpen}>{t('unlock_tier')}</Button>
      )}
      renderContent={({ onClose }) => (
        <Modal onClose={onClose} title={t('unlock_tier')}>
          <div>UnlockDiscountTier</div>
        </Modal>
      )}
    />
  )
}
