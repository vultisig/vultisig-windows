import { getStateProviderSetup } from '../../../../lib/ui/state/getStateProviderSetup';

export const sendTermsCount = 3;
export const getSendTermCopyKey = (index: number) => `send_terms_${index}`;

export const { useState: useSendTerms, provider: SendTermsProvider } =
  getStateProviderSetup<boolean[]>('SendTerms');
