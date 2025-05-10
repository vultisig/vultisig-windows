import { ProductLogo } from '@core/ui/product/ProductLogo'
import { useCore } from '@core/ui/state/core'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import useVersionCheck from '../../lib/hooks/useVersionCheck'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import {
  FixedWrapper,
  StyledButton,
  StyledModalCloseButton,
} from './UpdatedAvailablePopup.styles'

const UpdateAvailablePopup = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const { version } = useCore()

  const { latestVersion, updateAvailable, remoteError, isLoading } =
    useVersionCheck()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !remoteError && updateAvailable) {
      setIsOpen(true)
    }
  }, [isLoading, remoteError, updateAvailable])

  if (!isOpen) {
    return null
  }

  return (
    <FixedWrapper>
      <StyledModalCloseButton onClick={() => setIsOpen(false)} />
      <ProductLogo fontSize={200} />
      <Text size={14} color="contrast" weight={500}>
        {t('updatePopup.updateAvailableMessage', {
          latestVersion,
          version,
        })}
      </Text>
      <StyledButton onClickCapture={() => navigate({ id: 'checkUpdate' })}>
        {t('updatePopup.updateButton')}
      </StyledButton>
    </FixedWrapper>
  )
}

export default UpdateAvailablePopup
