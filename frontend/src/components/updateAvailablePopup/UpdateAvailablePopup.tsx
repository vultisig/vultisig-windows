import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useVersionCheck from '../../lib/hooks/useVersionCheck';
import { Text } from '../../lib/ui/text';
import { ProductLogo } from '../../ui/logo/ProductLogo';
import {
  FixedWrapper,
  StyledButton,
  StyledModalCloseButton,
} from './UpdatedAvailablePopup.styles';

const UpdateAvailablePopup = () => {
  const { t } = useTranslation();
  const { localVersion, latestVersion, updateAvailable } = useVersionCheck();
  const [isOpen, setIsOpen] = useState(updateAvailable);

  useEffect(() => {
    if (updateAvailable) {
      setIsOpen(true);
    }
  }, [updateAvailable]);

  if (!isOpen) {
    return null;
  }

  return (
    <FixedWrapper>
      <StyledModalCloseButton onClick={() => setIsOpen(false)} />
      <ProductLogo fontSize={200} />
      <Text size={14} color="contrast" weight={500}>
        {t('updatePopup.updateAvailableMessage', {
          latestVersion,
          localVersion,
        })}
      </Text>
      <StyledButton>{t('updatePopup.updateButton')}</StyledButton>
    </FixedWrapper>
  );
};

export default UpdateAvailablePopup;
