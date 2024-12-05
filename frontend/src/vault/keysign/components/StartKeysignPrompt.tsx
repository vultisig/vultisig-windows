import { useTranslation } from 'react-i18next';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Button } from '../../../lib/ui/buttons/Button';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithDisabledState,
  ComponentWithValueProps,
} from '../../../lib/ui/props';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { useCurrentVaultHasServer } from '../../state/currentVault';

export const StartKeysignPrompt = ({
  value: keysignPayload,
  isDisabled,
}: ComponentWithValueProps<KeysignPayload> & ComponentWithDisabledState) => {
  const { t } = useTranslation();

  const navigate = useAppNavigate();

  const hasServer = useCurrentVaultHasServer();

  if (hasServer) {
    return (
      <VStack gap={20}>
        <Button
          onClick={() => {
            navigate('fastKeysign', {
              state: {
                keysignPayload,
              },
            });
          }}
          isDisabled={isDisabled}
        >
          {t('fast_sign')}
        </Button>
        <Button
          kind="outlined"
          isDisabled={isDisabled}
          onClick={() => {
            navigate('keysign', {
              state: {
                keysignPayload,
              },
            });
          }}
        >
          {t('paired_sign')}
        </Button>
      </VStack>
    );
  }

  return (
    <Button
      isDisabled={isDisabled}
      onClick={() => {
        navigate('keysign', {
          state: {
            keysignPayload,
          },
        });
      }}
    >
      {t('continue')}
    </Button>
  );
};
