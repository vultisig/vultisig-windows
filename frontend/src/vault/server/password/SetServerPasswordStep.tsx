import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { z } from 'zod';

import { Button } from '../../../lib/ui/buttons/Button';
import { PasswordInput } from '../../../lib/ui/inputs/PasswordInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { OnBackProp, OnForwardProp } from '../../../lib/ui/props';
import { WarningBlock } from '../../../lib/ui/status/WarningBlock';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { KeygenEducationPrompt } from '../../keygen/shared/KeygenEducationPrompt';
import { useVaultPassword } from './state/password';

const PasswordWarningBlock = styled(WarningBlock)`
  max-width: max-content;
  font-size: 13px;
`;

const passwordSchema = z
  .object({
    password: z.string().min(1, 'passwordRequired'),
    confirmPassword: z
      .string()
      .min(1, 'fastVaultSetup.confirmPasswordIsRequired'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'fastVaultSetup.passwordDoNotMatch',
    path: ['confirmPassword'],
  });

type PasswordSchema = z.infer<typeof passwordSchema>;

export const SetServerPasswordStep = ({
  onForward,
  onBack,
}: OnForwardProp & Partial<OnBackProp>) => {
  const { t } = useTranslation();
  const [storedPassword, setStoredPassword] = useVaultPassword();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
    defaultValues: {
      password: storedPassword || '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: PasswordSchema) => {
    setStoredPassword(data.password);
    onForward();
  };

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
      />
      <PageContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack flexGrow gap={16}>
          <VStack gap={8}>
            <Text variant="h1Regular">{t('password')}</Text>
            <PasswordWarningBlock>
              {t('fastVaultSetup.passwordCannotBeRecovered')}
            </PasswordWarningBlock>
          </VStack>
          <VStack gap={8}>
            <VStack gap={4}>
              <PasswordInput
                {...register('password')}
                validationState={
                  isValid ? 'valid' : errors.password ? 'invalid' : undefined
                }
                placeholder={t('enter_password')}
                onValueChange={value => setValue('password', value)}
                autoFocus
              />
              {errors.password && (
                <Text color="danger" size={12}>
                  {errors.password.message}
                </Text>
              )}
            </VStack>
            <VStack gap={4}>
              <PasswordInput
                {...register('confirmPassword')}
                validationState={
                  isValid
                    ? 'valid'
                    : errors.confirmPassword
                      ? 'invalid'
                      : undefined
                }
                placeholder={t('verify_password')}
                onValueChange={value => setValue('confirmPassword', value)}
              />
              {errors.confirmPassword && errors.confirmPassword.message && (
                <Text color="danger" size={12}>
                  {t(errors.confirmPassword.message)}
                </Text>
              )}
            </VStack>
          </VStack>
        </VStack>
        <Button type="submit" isDisabled={Boolean(errors)}>
          {t('next')}
        </Button>
      </PageContent>
    </>
  );
};
