import { useTranslation } from 'react-i18next';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { KeysignActionFeeValue } from '../../../lib/types/keysign';
import { Button } from '../../../lib/ui/buttons/Button';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithDisabledState,
  ComponentWithValueProps,
} from '../../../lib/ui/props';
import { AppPathState } from '../../../navigation';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { useCurrentVaultHasServer } from '../../state/currentVault';

type StartKeysignPrompt = ComponentWithValueProps<KeysignPayload> &
  ComponentWithDisabledState & {
    fees: KeysignActionFeeValue | null;
  };
export const StartKeysignPrompt = ({
  value: keysignPayload,
  fees,
  isDisabled,
}: StartKeysignPrompt) => {
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
                fees,
              } as AppPathState['fastKeysign'],
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
                fees,
              } as AppPathState['keysign'],
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
