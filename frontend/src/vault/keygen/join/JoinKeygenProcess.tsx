import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import KeygenBackupNow from '../../../components/keygen/KeygenBackupNow';
import { Transition } from '../../../lib/ui/base/Transition';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { makeAppPath } from '../../../navigation';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenFailedState } from '../shared/KeygenFailedState';
import { useJoinKeygenMutation } from './mutations/useJoinKeygenMutation';
import { JoinKeygenPendingState } from './pending/JoinKeygenPendingState';

export const JoinKeygenProcess = () => {
  const { mutate: joinKeygen, ...joinKeygenState } = useJoinKeygenMutation();

  const { t } = useTranslation();

  useEffect(joinKeygen, [joinKeygen]);

  const navigate = useNavigate();

  return (
    <QueryDependant
      query={joinKeygenState}
      success={() => (
        <Transition
          delay={3000}
          from={
            <>
              <PageHeader
                primaryControls={<PageHeaderBackButton />}
                title={
                  <PageHeaderTitle>
                    {t('join')} {t('keygen')}
                  </PageHeaderTitle>
                }
              />
              <div className="text-center text-white">
                <img
                  src="/assets/icons/done.svg"
                  alt="done"
                  className="mx-auto mt-[30vh] mb-6"
                />
                <p className="text-2xl font-bold">{t('done')}</p>
                <div className="w-full fixed bottom-16 text-center">
                  <img
                    src="/assets/icons/wifi.svg"
                    alt="wifi"
                    className="mx-auto mb-4 w-8"
                  />
                  <p className="mb-4">{t('devices_on_same_wifi')}</p>
                </div>
              </div>
            </>
          }
          to={<KeygenBackupNow />}
        />
      )}
      error={error => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton />}
            title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
          />
          <KeygenFailedState
            message={error.message}
            onTryAgain={() => {
              navigate(makeAppPath('vaultList'));
            }}
          />
        </>
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton />}
            title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
          />
          <JoinKeygenPendingState />
        </>
      )}
    />
  );
};
