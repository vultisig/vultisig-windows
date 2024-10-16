import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Transition } from '../../../lib/ui/base/Transition';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { match } from '../../../lib/utils/match';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenType } from '../KeygenType';
import { useCurrentKeygenType } from '../state/currentKeygenType';
import { KeygenBackup } from './KeygenBackup';
import { KeygenFailedState } from './KeygenFailedState';
import { KeygenPendingState } from './KeygenPendingState';
import { KeygenSuccessState } from './KeygenSuccessState';
import { useKeygenMutation } from './mutations/useKeygenMutation';

type KeygenStepProps = ComponentWithBackActionProps & {
  onTryAgain: () => void;
};

export const KeygenStep = ({ onBack, onTryAgain }: KeygenStepProps) => {
  const { mutate: start, ...mutationState } = useKeygenMutation();

  const { t } = useTranslation();

  useEffect(start, [start]);

  const keygenType = useCurrentKeygenType();

  const title = match(keygenType, {
    [KeygenType.Keygen]: () => t('keygen'),
    [KeygenType.Reshare]: () => t('reshare'),
  });

  return (
    <QueryDependant
      query={mutationState}
      success={() => (
        <Transition
          delay={3000}
          from={
            <>
              <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
              <KeygenSuccessState />
            </>
          }
          to={<KeygenBackup />}
        />
      )}
      error={error => (
        <>
          <PageHeader title={<PageHeaderTitle>{title}</PageHeaderTitle>} />
          <KeygenFailedState message={error.message} onTryAgain={onTryAgain} />
        </>
      )}
      pending={() => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{title}</PageHeaderTitle>}
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
          />
          <KeygenPendingState />
        </>
      )}
    />
  );
};
