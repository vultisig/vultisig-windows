import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { z } from 'zod';

import { Button } from '../../../lib/ui/buttons/Button';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { useVaultPasswordHint } from './state/password-hint';

const passwordHintSchema = z.object({
  passwordHint: z.string().min(1, { message: 'fastVaultSetup.hintEmpty' }),
});

type PasswordHintSchema = z.infer<typeof passwordHintSchema>;

export const ServerPasswordHintStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & Partial<ComponentWithBackActionProps>) => {
  const { t } = useTranslation();
  const [storedPasswordHint, setStoredPasswordHint] = useVaultPasswordHint();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PasswordHintSchema>({
    resolver: zodResolver(passwordHintSchema),
    defaultValues: {
      passwordHint: storedPasswordHint || '',
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: PasswordHintSchema) => {
    setStoredPasswordHint(data.passwordHint);
    onForward();
  };

  return (
    <>
      <PageHeader primaryControls={<PageHeaderBackButton onClick={onBack} />} />
      <PageContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack flexGrow gap={16}>
          <VStack>
            <Text variant="h1Regular">
              {t('fastVaultSetup.addOptionalHint')}
            </Text>
            <Text size={14} color="shy">
              {t('fastVaultSetup.hintDescription')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <TextInput
              {...register('passwordHint')}
              withResetValueBtn
              isValid={isValid}
              isInvalid={!!errors.passwordHint}
              placeholder={t('fastVaultSetup.enterHint')}
              autoFocus
              onValueChange={value => setValue('passwordHint', value)}
            />
            {errors.passwordHint && errors.passwordHint.message && (
              <Text color="danger" size={12}>
                {t(errors.passwordHint.message)}
              </Text>
            )}
          </VStack>
        </VStack>
        <ButtonsWrapper fullWidth gap={8}>
          <StyledButton
            type="button"
            kind="secondary"
            onClick={() => onForward()}
          >
            {t('skip')}
          </StyledButton>
          <StyledButton type="submit" isDisabled={!!errors.passwordHint}>
            {t('next')}
          </StyledButton>
        </ButtonsWrapper>
      </PageContent>
    </>
  );
};

const ButtonsWrapper = styled(HStack)`
  align-self: center;
`;

const StyledButton = styled(Button)`
  flex: 1;
`;
