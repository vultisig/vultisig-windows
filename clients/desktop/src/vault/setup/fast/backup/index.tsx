import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../../lib/ui/buttons/Button';
import { OTPInput } from '../../../../lib/ui/inputs/OTPInput';
import { HStack, VStack } from '../../../../lib/ui/layout/Stack';
import { Text } from '../../../../lib/ui/text';
import { FlowPageHeader } from '../../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../../ui/page/PageContent';
import { AnimatedLoader } from '../../../../ui/pending/AnimatedLoader';
import { verifyVaultEmailCode } from '../../../fast/api/verifyVaultEmailCode';

type EmailConfirmationProps = {
  vaultId: string;
  onCompleted: () => void;
};

export const EmailConfirmation: FC<EmailConfirmationProps> = ({
  vaultId,
  onCompleted,
}) => {
  const { t } = useTranslation();
  const { isPending, mutate, error, isSuccess } = useMutation({
    mutationFn: (code: string) =>
      verifyVaultEmailCode({
        vaultId,
        code,
      }),
  });

  return (
    <>
      <FlowPageHeader title={t('email')} />
      <PageContent>
        <VStack flexGrow gap={12}>
          <VStack>
            <Text variant="h1Regular">
              {t('fastVaultSetup.backup.enterCode')}
            </Text>
            <Text size={14} color="shy">
              {t('fastVaultSetup.backup.codeInfo')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <OTPInput
              validation={error ? 'invalid' : isSuccess ? 'valid' : undefined}
              onCompleted={value => mutate(value)}
            />
            {error ? (
              <Text size={13} color="danger">
                {t('email_confirmation_code_error')}
              </Text>
            ) : (
              isPending && (
                <HStack gap={4}>
                  <StyledAnimatedLoader />
                  <Text weight={500} as="span" color="contrast" size={13}>
                    {t('fastVaultSetup.backup.verifyingCode')}
                  </Text>
                </HStack>
              )
            )}
          </VStack>
        </VStack>
        <Button
          isLoading={isPending}
          type="button"
          isDisabled={!isSuccess}
          onClick={onCompleted}
        >
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};

const StyledAnimatedLoader = styled(AnimatedLoader)`
  width: fit-content;
  position: relative;
  width: 20px;
  height: 20px;
`;
