import { useTranslation } from 'react-i18next';
import { VStack } from '../../../lib/ui/layout/Stack';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageSlice } from '../../../ui/page/PageSlice';
import { Text } from '../../../lib/ui/text';
import {
  InputField,
  InputFieldWrapper,
  IconButton,
} from './VaultBackupPage.styles';
import { EyeIcon } from '../../../lib/ui/icons/EyeIcon';
import { z } from 'zod';
import { FieldValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../lib/ui/buttons/Button';
import { useState } from 'react';

const passwordSchema = z
  .object({
    password: z.string().min(3, 'vault_backup_page_password_error').max(30),
    verifiedPassword: z
      .string()
      .min(3, 'Set a strong password and save it.')
      .max(30),
  })
  .refine(data => data.password === data.verifiedPassword, {
    message: 'vault_backup_page_verified_password_error',
    path: ['verifiedPassword'],
  });

const VaultBackupPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerifiedPasswordVisible, setIsVerifiedPasswordVisible] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: FieldValues) => {
    console.log('## data', data);
  };

  const { t } = useTranslation();

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_backup_page_title')}</PageHeaderTitle>
        }
      />
      <PageSlice gap={16}>
        <Text size={16} color="contrast" weight="600">
          {t('vault_backup_page_password_protection')}
        </Text>
        <VStack gap={12} as="form" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <InputFieldWrapper>
              <InputField
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder={t('vault_backup_page_password_input_placeholder')}
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
          <Button type="submit">{t('submit_button_text')}</Button>
        </VStack>
      </PageSlice>
    </VStack>
  );
};

export default VaultBackupPage;
