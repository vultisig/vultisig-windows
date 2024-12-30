import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { EyeIcon } from '../../../lib/ui/icons/EyeIcon';
import InfoGradientIcon from '../../../lib/ui/icons/InfoGradientIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { Text } from '../../../lib/ui/text';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { useBackupVaultMutation } from '../../../vault/mutations/useBackupVaultMutation';
import { vaultsQueryKey } from '../../../vault/queries/useVaultsQuery';
import { useCurrentVault } from '../../../vault/state/currentVault';
import {
  VaultBackupSchema,
  vaultBackupSchema,
} from './schemas/vaultBackupSchema';
import {
  ActionsWrapper,
  GradientText,
  IconButton,
  InfoPill,
  InputField,
  InputFieldWrapper,
} from './VaultBackupPage.styles';

const VaultBackupPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerifiedPasswordVisible, setIsVerifiedPasswordVisible] =
    useState(false);

  const vault = useCurrentVault();
  const navigate = useAppNavigate();
  const { t } = useTranslation();
  const invalidateQueries = useInvalidateQueries();

  const { mutate: backupVault, isPending, error } = useBackupVaultMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<VaultBackupSchema>({
    resolver: zodResolver(vaultBackupSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data?: FieldValues) => {
    const password = data?.password;
    if (!vault) return;

    backupVault(
      { vault, password },
      {
        onSuccess: () => {
          invalidateQueries(vaultsQueryKey);
          navigate('vault');
        },
      }
    );
  };

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_backup_page_title')}</PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        <Text size={16} color="contrast" weight="600">
          {t('vault_backup_page_password_protection')}
        </Text>
        <VStack
          flexGrow={true}
          justifyContent="space-between"
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <VStack gap={12}>
            <div>
              <InputFieldWrapper>
                <InputField
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder={t(
                    'vault_backup_page_password_input_placeholder'
                  )}
                  {...register('password')}
                />

                <IconButton
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <EyeIcon />
                </IconButton>
              </InputFieldWrapper>
              {errors.password?.message && (
                <Text size={12} color="danger">
                  {typeof errors.password.message === 'string' &&
                    t(errors.password.message)}
                </Text>
              )}
            </div>
            <div>
              <InputFieldWrapper>
                <InputField
                  type={isVerifiedPasswordVisible ? 'text' : 'password'}
                  placeholder={t(
                    'vault_backup_page_verified_password_input_placeholder'
                  )}
                  {...register('verifiedPassword')}
                />

                <IconButton
                  onClick={() =>
                    setIsVerifiedPasswordVisible(!isVerifiedPasswordVisible)
                  }
                >
                  <EyeIcon />
                </IconButton>
              </InputFieldWrapper>
              {errors.verifiedPassword && (
                <Text size={12} color="danger">
                  {' '}
                  {typeof errors.verifiedPassword.message === 'string' &&
                    t(errors.verifiedPassword.message)}
                </Text>
              )}
            </div>
          </VStack>
          <ActionsWrapper gap={16}>
            <InfoPill kind="outlined">
              <InfoGradientIcon />{' '}
              <Text color="contrast" size={13}>
                {t('vault_backup_page_password_info')}
              </Text>
            </InfoPill>
            <Button
              isDisabled={!isValid || !isDirty || isPending}
              type="submit"
            >
              {t(
                isPending
                  ? 'vault_backup_page_submit_loading_button_text'
                  : 'vault_backup_page_submit_button_text'
              )}
            </Button>
            <Button
              disabled={isPending}
              kind="outlined"
              type="button"
              onClick={onSubmit}
            >
              <GradientText>
                {t('vault_backup_page_skip_button_text')}
              </GradientText>
            </Button>
            {error && (
              <Text size={12} color="danger">
                {error?.message}
              </Text>
            )}
          </ActionsWrapper>
        </VStack>
      </PageSlice>
    </VStack>
  );
};

export default VaultBackupPage;
