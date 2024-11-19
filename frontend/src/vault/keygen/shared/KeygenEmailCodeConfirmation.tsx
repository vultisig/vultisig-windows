import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { storage } from '../../../../wailsjs/go/models';
import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { Text } from '../../../lib/ui/text';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { appPaths } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import {
  userEmailVerificationCodeQueryKey,
  useUserEmailVerificationCodeMutation,
} from '../../mutations/useUserEmailVerificationCodeMutation';

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
    mutateAsync: verifyEmailCode,
    isPending,
    error,
  } = useUserEmailVerificationCodeMutation();
  const invalidateQueries = useInvalidateQueries();

  const handleVerifyEmailCode = async () => {
    const result = await verifyEmailCode({
      code: confirmationValue,
      publicKeyECDSA: vault?.public_key_ecdsa || '',
    });

    if (result && result.success) {
      navigate(appPaths.keygenBackup);
      invalidateQueries(userEmailVerificationCodeQueryKey);
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
          onSubmit: handleVerifyEmailCode,
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
            {isPending ? t('loading') : t('continue')}
          </Button>
          {error && (
            <Text color="danger" size={12}>
              {t(extractErrorMsg(error))}
            </Text>
          )}
        </VStack>
      </PageContent>
    </>
  );
};
