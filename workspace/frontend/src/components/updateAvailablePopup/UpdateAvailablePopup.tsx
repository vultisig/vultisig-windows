import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useVersionCheck from '../../lib/hooks/useVersionCheck';
import { Text } from '../../lib/ui/text';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { ProductLogo } from '../../ui/logo/ProductLogo';
import {
  FixedWrapper,
  StyledButton,
  StyledModalCloseButton,
} from './UpdatedAvailablePopup.styles';

const UpdateAvailablePopup = () => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const {
    localVersion,
    latestVersion,
    updateAvailable,
    isLocalVersionValid,
    remoteError,
    isLoading,
  } = useVersionCheck();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isError = !isLocalVersionValid || remoteError;
    if (!isLoading && !isError && updateAvailable) {
      setIsOpen(true);
    }
  }, [isLoading, isLocalVersionValid, remoteError, updateAvailable]);

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
      <StyledButton onClickCapture={() => navigate('checkUpdate')}>
        {t('updatePopup.updateButton')}
      </StyledButton>
    </FixedWrapper>
  );
};

export default UpdateAvailablePopup;
