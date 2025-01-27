import { FC, PropsWithChildren } from 'react';

import { getStateProviderSetup } from '../../../../lib/ui/state/getStateProviderSetup';

export const { useState: useOnboardingCompletion, provider: Provider } =
  getStateProviderSetup<boolean>('OnboardingCompletion');

export const OnboardingCompletionProvider: FC<PropsWithChildren> = ({
  children,
}) => <Provider initialValue={false}>{children}</Provider>;
