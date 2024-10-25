import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { PasswordInput } from '../../../lib/ui/inputs/PasswordInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithForwardActionProps } from '../../../lib/ui/props';
import { InfoBlock } from '../../../lib/ui/status/InfoBlock';
import { Text } from '../../../lib/ui/text';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useAssertCurrentVault } from '../../state/useCurrentVault';
import { getStorageVaultId } from '../../utils/storageVault';
import { getVaultFromServer } from '../utils/getVaultFromServer';
import { useVaultPassword } from './state/password';

export const ServerPasswordStep: React.FC<ComponentWithForwardActionProps> = ({
  onForward,
}) => {
  const { t } = useTranslation();

  const [password, setPassword] = useVaultPassword();

  const vault = useAssertCurrentVault();

  const { mutate, error, isPending } = useMutation({
    mutationFn: async () =>
      getVaultFromServer({
        vaultId: getStorageVaultId(vault),
        password,
      }),
    onSuccess: onForward,
  });

  const isDisabled = useMemo(() => {
    if (!password) {
      return t('password_required');
    }
  }, [password, t]);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('password')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
      />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: mutate,
          isDisabled,
        })}
      >
        <VStack gap={20} flexGrow>
          <PasswordInput
            placeholder={t('enter_password')}
            value={password}
            onValueChange={setPassword}
            label={t('fast_vault_password')}
          />
          <InfoBlock>{t('password_to_decrypt')}</InfoBlock>
        </VStack>
        <VStack gap={20}>
          <Button isLoading={isPending} type="submit">
            {t('continue')}
          </Button>
          {error && <Text color="danger">{extractErrorMsg(error)}</Text>}
        </VStack>
      </PageContent>
    </>
  );
};
