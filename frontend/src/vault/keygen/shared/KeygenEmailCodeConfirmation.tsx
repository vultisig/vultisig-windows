import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { storage } from '../../../../wailsjs/go/models';
import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { appPaths } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useUserEmailVerificationCodeQuery } from '../../queries/useUserEmailVerificationCodeQuery';

type KeygenEmailCodeConfirmationProps = {
  vault: storage.Vault | null;
};

export const KeygenEmailCodeConfirmation = ({
  vault,
}: KeygenEmailCodeConfirmationProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmationValue, setConfirmationValue] = useState('');
  const {
    data,
    isFetching,
    error,
    refetch: verifyEmailVerificationCode,
  } = useUserEmailVerificationCodeQuery({
    publicKeyECDSA: vault?.public_key_ecdsa || '',
    code: confirmationValue,
  });

  useEffect(() => {
    if (data) {
      navigate(appPaths.keygenBackup);
    }
  }, [data, navigate]);

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
          onSubmit: verifyEmailVerificationCode,
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
            {isFetching ? t('loading') : t('continue')}
          </Button>
          {error && (
            <Text color="danger" size={12}>
              {extractErrorMsg(error)}
            </Text>
          )}
        </VStack>
      </PageContent>
    </>
  );
};
