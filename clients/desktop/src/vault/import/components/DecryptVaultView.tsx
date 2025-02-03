import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { PasswordInput } from '../../../lib/ui/inputs/PasswordInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';

type DecryptVaultViewProps = {
  isPending: boolean;
  error: Error | null;
  onSubmit: (password: string) => void;
};

export const DecryptVaultView = ({
  isPending,
  error,
  onSubmit,
}: DecryptVaultViewProps) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');

  const isDisabled = useMemo(() => {
    if (!password) {
      return t('password_required');
    }
  }, [password, t]);

  return (
    <>
      <FlowPageHeader title={t('password')} />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: () => onSubmit(password),
          isDisabled,
        })}
      >
        <VStack gap={20} flexGrow>
          <PasswordInput
            placeholder={t('enter_password')}
            value={password}
            onValueChange={setPassword}
            label={t('vault_password')}
          />
        </VStack>
        <VStack gap={20}>
          <Button isLoading={isPending} type="submit">
            {t('continue')}
          </Button>
          {error && <Text color="danger">{t('incorrect_password')}</Text>}
        </VStack>
      </PageContent>
    </>
  );
};
