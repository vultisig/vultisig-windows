import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { OnForwardProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';
import { verifyVaultEmailCode } from '../api/verifyVaultEmailCode';

type VerifyEmailStepProps = {
  vaultId: string;
} & OnForwardProp;

export const VerifyEmailStep = ({
  vaultId,
  onForward,
}: VerifyEmailStepProps) => {
  const { t } = useTranslation();
  const [confirmationValue, setConfirmationValue] = useState('');

  const { isPending, mutate, error } = useMutation({
    mutationFn: () =>
      verifyVaultEmailCode({
        vaultId,
        code: confirmationValue,
      }),
    onSuccess: onForward,
  });

  return (
    <>
      <FlowPageHeader title={t('email')} />
      <PageContent
        as="form"
        {...getFormProps({
          isDisabled: !confirmationValue,
          onSubmit: mutate,
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
          <Button
            isLoading={isPending}
            type="submit"
            isDisabled={!confirmationValue}
          >
            {t('continue')}
          </Button>
          {error && (
            <Text color="danger">{t('email_confirmation_code_error')}</Text>
          )}
        </VStack>
      </PageContent>
    </>
  );
};
