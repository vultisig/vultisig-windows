import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { appPaths } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';

export const KeygenEmailCodeConfirmation = () => {
  // TODO: fetch the verification code from the server and verify it with user input
  const VERIFICATION_CODE = '';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmationValue, setConfirmationValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // TODO: use the actual verification
    if (confirmationValue === VERIFICATION_CODE) {
      navigate(appPaths.keygenBackup);
    } else {
      setError(t('email_confirmation_code_error'));
    }
  };

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('email')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={() => navigate(-1)} />}
      />
      <PageContent
        as="form"
        {...getFormProps({
          isDisabled: !confirmationValue,
          onSubmit: handleSubmit,
        })}
      >
        <VStack flexGrow gap={12}>
          <Text size={14} weight="600" color="contrast">
            {t('email_confirmation_code_label')}:
          </Text>
          <TextInput
            placeholder={t('email_confirmation')}
            value={confirmationValue}
            onValueChange={setConfirmationValue}
            autoFocus
          />
        </VStack>
        <VStack gap={20}>
          <Button type="submit" isDisabled={!confirmationValue}>
            {t('continue')}
          </Button>
          <Text color="danger" size={12}>
            {error}
          </Text>
        </VStack>
      </PageContent>
    </>
  );
};
