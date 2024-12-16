import { useEffect } from 'react';

import { StepTransition } from '../../../lib/ui/base/StepTransition';
import {
  ComponentWithBackActionProps,
  TitledComponentProps,
} from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { VerifyEmailStep } from '../../fast/components/VerifyEmailStep';
import { haveServerSigner } from '../../fast/utils/haveServerSigner';
import { getStorageVaultId } from '../../utils/storageVault';
import { KeygenFailedState } from './KeygenFailedState';
import { KeygenPendingState } from './KeygenPendingState';
import { KeygenSuccessStep } from './KeygenSuccessStep';
import { useKeygenMutation } from './mutations/useKeygenMutation';

type KeygenStepProps = ComponentWithBackActionProps &
  TitledComponentProps & {
    onTryAgain: () => void;
  };

export const KeygenStep = ({ onTryAgain, title }: KeygenStepProps) => {
  const { mutate: start, ...mutationState } = useKeygenMutation();

  useEffect(start, [start]);

  return (
    <MatchQuery
      value={mutationState}
      success={vault => {
        if (haveServerSigner(vault.signers)) {
          return (
            <StepTransition
              from={({ onForward }) => (
                <VerifyEmailStep
                  onForward={onForward}
                  vaultId={getStorageVaultId(vault)}
                />
              )}
              to={() => <KeygenSuccessStep value={vault} title={title} />}
            />
          );
        }

        return <KeygenSuccessStep value={vault} title={title} />;
      }}
      error={error => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <KeygenFailedState message={error.message} onTryAgain={onTryAgain} />
        </>
      )}
      pending={() => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <KeygenPendingState />
        </>
      )}
    />
  );
};
