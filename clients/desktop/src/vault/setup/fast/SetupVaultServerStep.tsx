import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { OnBackProp, OnForwardProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { KeygenFailedState } from '../../keygen/shared/KeygenFailedState';
import { WaitForServerStates } from '../../server/components/WaitForServerStates';
import { useVaultType } from '../shared/state/vaultType';
import { useVaultCreationPreparation } from './hooks/useVaultCreationPreparation';

export const SetupVaultServerStep: FC<OnForwardProp & OnBackProp> = ({
  onForward,
  onBack,
}) => {
  const state = useVaultCreationPreparation();
  const { t } = useTranslation();
  const type = useVaultType();

  return (
    <MatchQuery
      value={state}
      pending={() => <WaitForServerStates state="pending" />}
      success={() => (
        <WaitForServerStates state="success" onForward={onForward} />
      )}
      error={error =>
        error.peersStepError ? (
          <KeygenFailedState
            message={error.peersStepError.message}
            onTryAgain={onBack}
          />
        ) : (
          <FullPageFlowErrorState
            message={extractErrorMsg(error)}
            title={t('keygen_for_vault', { type: t(type) })}
          />
        )
      }
    />
  );
};
