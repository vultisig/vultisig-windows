import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../../wailsjs/go/models';
import { Vault } from '../../../gen/vultisig/vault/v1/vault_pb';
import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { PasswordInput } from '../../../lib/ui/inputs/PasswordInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  ValueFinishProps,
} from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { fromBase64 } from '../../../lib/utils/fromBase64';
import { pipe } from '../../../lib/utils/pipe';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';
import { decryptVault } from '../../encryption/decryptVault';
import { toStorageVault } from '../../utils/storageVault';

export const DecryptVaultStep = ({
  value,
  onFinish,
}: ComponentWithValueProps<string> & ValueFinishProps<storage.Vault>) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');

  const { mutate, error, isPending } = useMutation({
    mutationFn: async () =>
      pipe(
        value,
        fromBase64,
        vault =>
          decryptVault({
            password,
            vault,
          }),
        v => new Uint8Array(v),
        Vault.fromBinary,
        toStorageVault
      ),
    onSuccess: onFinish,
  });

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
          onSubmit: mutate,
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
