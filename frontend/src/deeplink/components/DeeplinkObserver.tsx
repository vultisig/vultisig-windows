import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { GetOSArgs } from '../../../wailsjs/go/main/App';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { deepLinkBaseUrl } from '../config';

export const DeeplinkObserver = () => {
  const navigate = useAppNavigate();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const args = await GetOSArgs();

      const url = args.find(arg => arg.startsWith(deepLinkBaseUrl));

      if (url) {
        navigate('deeplink', { state: { url } });
      }
    },
  });

  useEffect(mutate, [mutate]);

  return null;
};
